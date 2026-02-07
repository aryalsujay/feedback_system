const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const Feedback = require('../models/Feedback');
const { sendEmail } = require('./mailer');

const getConfig = (filename) => {
    const configPath = path.join(__dirname, '../../config', filename);
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
};

const calculateAnalytics = (feedbacks, questions) => {
    const analytics = {};

    questions.forEach(q => {
        const answers = feedbacks.map(fb => {
            // Handle Map or Object
            let val;
            if (fb.answers instanceof Map) val = fb.answers.get(q.id);
            else val = fb.answers[q.id];
            return val;
        }).filter(val => val !== undefined && val !== null && val !== '');

        if (q.type === 'smiley' || q.type === 'number_rating' || q.type === 'rating_5') {
            // Calculate Average for all rating types
            const sum = answers.reduce((acc, val) => acc + parseInt(val, 10), 0);
            const avg = answers.length > 0 ? (sum / answers.length).toFixed(1) : 'NaN';

            let extra = {};
            if (q.type === 'smiley') {
                const counts = { good: 0, average: 0, bad: 0 };
                // Mapping 1-5 to categories for backward compatibility in display if needed
                // 1-2: Bad, 3: Average, 4-5: Good
                answers.forEach(a => {
                    const v = parseInt(a, 10);
                    if (v >= 4) counts.good++;
                    else if (v === 3) counts.average++;
                    else counts.bad++;
                });
                extra = { counts };
            }

            analytics[q.id] = { type: q.type, average: avg, total: answers.length, ...extra };
        } else {
            analytics[q.id] = { type: 'text', count: answers.length };
        }
    });

    return analytics;
};

const generatePDF = (deptName, feedbacks, questions) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const buffers = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        // Header
        doc.fontSize(20).text(`Weekly Feedback Report: ${deptName}`, { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
        doc.moveDown(2);

        if (feedbacks.length === 0) {
            doc.text('No feedback received this week.');
        } else {
            // --- Analytics Summary ---
            doc.fontSize(16).text('Feedback Summary', { underline: true });
            doc.moveDown();

            // Table Headers
            const startX = 50;
            const col1X = 50;       // Question
            const col2X = 350;      // Average Rating (Swapped)
            const col3X = 450;      // Total Responses (Swapped)
            let currentY = doc.y;

            doc.font('Helvetica-Bold').fontSize(12);
            doc.text('Question', col1X, currentY);
            doc.text('Average Rating', col2X, currentY);
            doc.text('Total Responses', col3X, currentY);

            // Draw header line
            currentY += 15;
            doc.moveTo(startX, currentY).lineTo(550, currentY).stroke();
            currentY += 10;

            doc.font('Helvetica').fontSize(10);

            const analytics = calculateAnalytics(feedbacks, questions);

            questions.forEach(q => {
                const data = analytics[q.id];
                if (!data) return;

                // Check for page break
                if (currentY > 700) {
                    doc.addPage();
                    currentY = 50;
                }

                // Question Title & Text
                // Format ID to Title Case (e.g., 'food_quality' -> 'Food Quality')
                const title = q.id.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

                doc.font('Helvetica-Bold').text(title, col1X, currentY, { width: 280 });
                const titleHeight = doc.heightOfString(title, { width: 280 });

                doc.font('Helvetica').text(q.text, col1X, currentY + titleHeight + 5, { width: 280 });
                const textHeight = doc.heightOfString(q.text, { width: 280 });

                const totalBlockHeight = titleHeight + 5 + textHeight;

                // Render Stats (aligned with top of block or centered? Top is safer for flow)
                // Using a slightly offset Y to align with the Title or average it? 
                // Let's keep it at currentY (aligned with Title) for table row feel, 
                // OR maybe vertically center if brief. 
                // Let's stick to currentY for consistency so it looks like:
                // Heading      Avg   Total
                // Question...

                if (data.type === 'smiley' || data.type === 'number_rating' || data.type === 'rating_5') {
                    doc.text(`${data.average} / 5`, col2X + 10, currentY);
                    doc.text(data.total.toString(), col3X + 20, currentY);
                } else {
                    doc.text('-', col2X + 10, currentY);
                    doc.text(`(Text: ${data.count})`, col3X, currentY);
                }

                currentY += Math.max(totalBlockHeight, 20) + 15; // Extra spacing between rows
            });

            doc.moveDown(2);
            doc.addPage(); // Start details on new page

            // --- Individual Submissions ---
            doc.fontSize(16).text('Individual Submissions', { underline: true });
            doc.moveDown();

            feedbacks.forEach((fb, index) => {
                // Check if we need a new page for the start of a submission (heuristic)
                if (doc.y > 700) doc.addPage();

                const submitter = fb.name && fb.name !== 'Anonymous' ? `${fb.name} (${fb.email || 'No Email'})` : 'Anonymous';

                doc.fontSize(14).font('Helvetica-Bold').text(`Submission #${index + 1} - ${new Date(fb.createdAt).toLocaleString()}`, { underline: true });
                doc.fontSize(10).font('Helvetica').text(`From: ${submitter}`);
                doc.moveDown(0.5);
                doc.fontSize(12);

                const answersMap = fb.answers instanceof Map ? fb.answers : new Map(Object.entries(fb.answers));

                for (const [qId, answer] of answersMap) {
                    // Check for page break within submission
                    if (doc.y > 750) doc.addPage();

                    const questionObj = questions.find(q => q.id === qId);
                    const qText = questionObj?.text || qId;

                    doc.font('Helvetica-Bold').text(`${qText}:`, { continued: true });

                    let displayAnswer = answer;
                    // Resolve Label if applicable
                    if (questionObj && questionObj.labels && questionObj.labels[answer]) {
                        displayAnswer = `${answer} (${questionObj.labels[answer]})`;
                    }

                    doc.font('Helvetica').text(` ${displayAnswer}`);
                }
                doc.moveDown(1.5);
            });
        }

        doc.end();
    });
};

const generateAndSendReports = async (customStart, customEnd, deptFilter = null, customRecipients = null) => {
    console.log('Starting report generation...');

    const emailsConfig = getConfig('emails.json');
    const questionsConfig = getConfig('questions.json');

    const endDate = customEnd ? new Date(customEnd) : new Date();
    // Default to 7 days before endDate if no start date provided
    const startDate = customStart ? new Date(customStart) : new Date(new Date(endDate).setDate(endDate.getDate() - 7));

    console.log(`Generating reports for period: ${startDate.toDateString()} - ${endDate.toDateString()}`);

    try {
        const feedbackList = await Feedback.find({
            createdAt: { $gte: startDate, $lt: endDate }
        });

        console.log(`Found ${feedbackList.length} feedbacks in total.`);

        const groupedFeedback = {};

        feedbackList.forEach(fb => {
            if (!groupedFeedback[fb.department]) {
                groupedFeedback[fb.department] = [];
            }
            groupedFeedback[fb.department].push(fb);
        });

        const departments = deptFilter || Object.keys(emailsConfig);
        const selectedDepts = departments.filter(d => d !== 'admin');

        // CUSTOM REPORT MODE: Consolidate emails for recipients who appear in multiple departments
        if (customRecipients) {
            console.log('Custom report mode: Consolidating emails by recipient');

            // Build a map of recipient email -> departments they should receive
            const recipientDeptMap = new Map();

            // For custom reports, all recipients get all selected departments
            customRecipients.forEach(email => {
                recipientDeptMap.set(email, [...selectedDepts]);
            });

            // Generate all PDFs first
            const allPDFs = new Map(); // deptId -> { pdfBuffer, deptName, feedbackCount }

            for (const deptId of selectedDepts) {
                const feedbacks = groupedFeedback[deptId] || [];
                console.log(`Generating PDF for department: ${deptId} with ${feedbacks.length} feedbacks.`);

                const deptName = questionsConfig[deptId]?.name || deptId;
                const questions = questionsConfig[deptId]?.questions || [];

                try {
                    const pdfBuffer = await generatePDF(deptName, feedbacks, questions);
                    allPDFs.set(deptId, { pdfBuffer, deptName, feedbackCount: feedbacks.length });
                } catch (err) {
                    console.error(`PDF Generation failed for ${deptName}:`, err.message);
                    allPDFs.set(deptId, { pdfBuffer: null, deptName, feedbackCount: feedbacks.length, error: err.message });
                }
            }

            // Send consolidated emails
            const uniqueRecipients = Array.from(recipientDeptMap.keys());

            for (const recipientEmail of uniqueRecipients) {
                const recipientDepts = recipientDeptMap.get(recipientEmail);

                // Build attachments for this recipient
                const attachments = [];
                const deptDetails = [];
                let totalFeedbacks = 0;
                let hasPdfErrors = false;

                for (const deptId of recipientDepts) {
                    const pdfData = allPDFs.get(deptId);
                    if (!pdfData) continue;

                    if (pdfData.pdfBuffer) {
                        attachments.push({
                            filename: `Feedback_Report_${deptId}_${endDate.toISOString().split('T')[0]}.pdf`,
                            content: pdfData.pdfBuffer
                        });
                    } else {
                        hasPdfErrors = true;
                    }

                    deptDetails.push({
                        name: pdfData.deptName,
                        count: pdfData.feedbackCount,
                        error: pdfData.error
                    });
                    totalFeedbacks += pdfData.feedbackCount;
                }

                // Determine subject based on number of departments
                const subject = recipientDepts.length > 1
                    ? `Weekly Feedback Report - Global Vipassana Pagoda (${startDate.toLocaleDateString()})`
                    : `Weekly Feedback Report - ${deptDetails[0].name} (${startDate.toLocaleDateString()})`;

                // Build email body
                const deptList = deptDetails.map(d => `<li><strong>${d.name}</strong>: ${d.count} submission(s)</li>`).join('');

                let html = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                        <h2 style="color: #bfa57d; border-bottom: 2px solid #bfa57d; padding-bottom: 10px;">Weekly Feedback Report</h2>
                        <p style="font-size: 16px;">Dear Team,</p>
                        <p>Please find attached the detailed feedback analysis reports for the following department(s):</p>

                        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <p style="margin: 5px 0;"><strong>Period:</strong> ${startDate.toDateString()} - ${endDate.toDateString()}</p>
                            <p style="margin: 5px 0;"><strong>Departments Included:</strong></p>
                            <ul style="margin: 10px 0;">
                                ${deptList}
                            </ul>
                            <p style="margin: 5px 0;"><strong>Total Submissions:</strong> ${totalFeedbacks}</p>
                        </div>

                        <p>The attached PDF(s) contain detailed breakdowns of ratings and user suggestions.</p>

                        <br/>
                        <p style="font-size: 14px; color: #777;">
                            Best Regards,<br/>
                            <strong>Global Vipassana Pagoda Feedback System</strong>
                        </p>
                    </div>
                `;

                if (hasPdfErrors) {
                    html += `
                        <div style="background-color: #ffebee; border: 1px solid #ffcdd2; padding: 10px; margin-top: 20px; border-radius: 4px; color: #b71c1c;">
                            <strong>⚠️ PDF Generation Failed</strong><br/>
                            Some PDF reports could not be generated due to system errors.
                            Please check server logs.
                        </div>
                    `;
                }

                // Send consolidated email
                await sendEmail([recipientEmail], subject, html, attachments);
                console.log(`Consolidated report sent to ${recipientEmail} with ${attachments.length} PDF(s)`);
            }

            console.log('All consolidated reports sent successfully.');
        }
        // SCHEDULED REPORT MODE: Consolidate by email for recipients in multiple departments
        else {
            console.log('Scheduled report mode: Consolidating emails by recipient');

            // Build a map of recipient email -> departments they are configured for
            const recipientDeptMap = new Map();

            for (const deptId of selectedDepts) {
                const recipients = emailsConfig[deptId];
                if (!recipients) continue;

                recipients.forEach(email => {
                    if (!recipientDeptMap.has(email)) {
                        recipientDeptMap.set(email, []);
                    }
                    recipientDeptMap.get(email).push(deptId);
                });
            }

            // Generate all PDFs first
            const allPDFs = new Map(); // deptId -> { pdfBuffer, deptName, feedbackCount }

            for (const deptId of selectedDepts) {
                const feedbacks = groupedFeedback[deptId] || [];
                console.log(`Generating PDF for department: ${deptId} with ${feedbacks.length} feedbacks.`);

                const deptName = questionsConfig[deptId]?.name || deptId;
                const questions = questionsConfig[deptId]?.questions || [];

                try {
                    const pdfBuffer = await generatePDF(deptName, feedbacks, questions);
                    allPDFs.set(deptId, { pdfBuffer, deptName, feedbackCount: feedbacks.length });
                } catch (err) {
                    console.error(`PDF Generation failed for ${deptName}:`, err.message);
                    allPDFs.set(deptId, { pdfBuffer: null, deptName, feedbackCount: feedbacks.length, error: err.message });
                }
            }

            // Send consolidated emails
            const uniqueRecipients = Array.from(recipientDeptMap.keys());

            for (const recipientEmail of uniqueRecipients) {
                const recipientDepts = recipientDeptMap.get(recipientEmail);

                // Build attachments for this recipient
                const attachments = [];
                const deptDetails = [];
                let totalFeedbacks = 0;
                let hasPdfErrors = false;

                for (const deptId of recipientDepts) {
                    const pdfData = allPDFs.get(deptId);
                    if (!pdfData) continue;

                    if (pdfData.pdfBuffer) {
                        attachments.push({
                            filename: `Feedback_Report_${deptId}_${endDate.toISOString().split('T')[0]}.pdf`,
                            content: pdfData.pdfBuffer
                        });
                    } else {
                        hasPdfErrors = true;
                    }

                    deptDetails.push({
                        name: pdfData.deptName,
                        count: pdfData.feedbackCount,
                        error: pdfData.error
                    });
                    totalFeedbacks += pdfData.feedbackCount;
                }

                // Determine subject based on number of departments
                const subject = recipientDepts.length > 1
                    ? `Weekly Feedback Report - Global Vipassana Pagoda (${startDate.toLocaleDateString()})`
                    : `Weekly Feedback Report - ${deptDetails[0].name} (${startDate.toLocaleDateString()})`;

                // Build email body
                const deptList = deptDetails.map(d => `<li><strong>${d.name}</strong>: ${d.count} submission(s)</li>`).join('');

                let html = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                        <h2 style="color: #bfa57d; border-bottom: 2px solid #bfa57d; padding-bottom: 10px;">Weekly Feedback Report</h2>
                        <p style="font-size: 16px;">Dear Team,</p>
                        <p>Please find attached the detailed feedback analysis report${recipientDepts.length > 1 ? 's' : ''} for ${recipientDepts.length > 1 ? 'the following department(s)' : '<strong>' + deptDetails[0].name + '</strong>'}:</p>

                        ${recipientDepts.length > 1 ? `
                        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <p style="margin: 5px 0;"><strong>Period:</strong> ${startDate.toDateString()} - ${endDate.toDateString()}</p>
                            <p style="margin: 5px 0;"><strong>Departments Included:</strong></p>
                            <ul style="margin: 10px 0;">
                                ${deptList}
                            </ul>
                            <p style="margin: 5px 0;"><strong>Total Submissions:</strong> ${totalFeedbacks}</p>
                        </div>
                        ` : `
                        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <p style="margin: 5px 0;"><strong>Period:</strong> ${startDate.toDateString()} - ${endDate.toDateString()}</p>
                            <p style="margin: 5px 0;"><strong>Total Submissions:</strong> ${totalFeedbacks}</p>
                        </div>
                        `}

                        <p>The attached PDF${recipientDepts.length > 1 ? 's contain' : ' contains a'} detailed breakdown${recipientDepts.length > 1 ? 's' : ''} of ratings and user suggestions.</p>

                        <br/>
                        <p style="font-size: 14px; color: #777;">
                            Best Regards,<br/>
                            <strong>Global Vipassana Pagoda Feedback System</strong>
                        </p>
                    </div>
                `;

                if (hasPdfErrors) {
                    html += `
                        <div style="background-color: #ffebee; border: 1px solid #ffcdd2; padding: 10px; margin-top: 20px; border-radius: 4px; color: #b71c1c;">
                            <strong>⚠️ PDF Generation Failed</strong><br/>
                            ${recipientDepts.length > 1 ? 'Some PDF reports' : 'The PDF report'} could not be generated due to ${recipientDepts.length > 1 ? 'system errors' : 'a system error'}.
                            Please check server logs.
                        </div>
                    `;
                }

                // Send consolidated email
                await sendEmail([recipientEmail], subject, html, attachments);
                console.log(`Consolidated report sent to ${recipientEmail} with ${attachments.length} PDF(s) for departments: ${recipientDepts.join(', ')}`);
            }

            console.log('All consolidated reports sent successfully.');
        }
    } catch (error) {
        console.error('Error generating reports:', error);
    }
};

module.exports = { generateAndSendReports, generatePDF };

