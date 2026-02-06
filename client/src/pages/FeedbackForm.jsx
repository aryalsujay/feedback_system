import React, { useState } from 'react';
import { API_BASE_URL } from '../config';
import { useParams, useNavigate } from 'react-router-dom';
import useQuestions from '../hooks/useQuestions';
import GlassCard from '../components/GlassCard';
import RatingSmiley from '../components/RatingSmiley';
import StarRating from '../components/StarRating';
import NumberRating from '../components/NumberRating';
import OptionSelect from '../components/OptionSelect';
import Button from '../components/ui/Button';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, Loader2, AlertCircle } from 'lucide-react';

const FeedbackForm = () => {
    const { departmentId } = useParams();
    const navigate = useNavigate();
    const { questions, loading, error } = useQuestions();

    const [answers, setAnswers] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-pagoda-gold" size={48} /></div>;
    if (error || !questions) return <div className="min-h-screen flex items-center justify-center text-pagoda-error">Failed to load configuration.</div>;

    const department = questions[departmentId];

    if (!department) {
        return <div className="p-10 text-center text-pagoda-stone-500">Department not found</div>;
    }

    const handleAnswer = (qId, value) => {
        setAnswers(prev => ({ ...prev, [qId]: value }));
    };

    // Validation: Check if all non-text questions have an answer
    const isFormValid = department && department.questions.every(q => {
        // "text" type questions are optional (suggestion/comments)
        if (q.type === 'text') return true;
        // Other types (smiley, rating_5, number_rating, option_select) must have a value
        return answers[q.id] !== undefined && answers[q.id] !== null;
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setSubmitError(null);

        const { name, email, contact, location, ...questionAnswers } = answers;

        try {
            const response = await fetch(`${API_BASE_URL}/api/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    departmentId,
                    answers: questionAnswers,
                    name: name, // If empty/undefined, backend handles it as anonymous
                    email: email,
                    contact: contact,
                    location: location
                }),
            });

            if (!response.ok) throw new Error('Failed to submit feedback');
            navigate('/success');
        } catch (err) {
            console.error(err);
            setSubmitError('Failed to submit feedback. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen py-10 px-4 md:px-8 flex flex-col items-center relative bg-pagoda-stone-50">

            <div className="w-full max-w-3xl z-10">
                <div className="mb-8">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/')}
                        className="pl-0 gap-2 text-pagoda-stone-500 hover:text-pagoda-gold hover:bg-transparent"
                    >
                        <ArrowLeft size={18} /> Back to Departments
                    </Button>
                </div>


                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-serif text-pagoda-stone-900 mb-3">{department.name}</h1>
                    <div className="h-0.5 w-16 bg-pagoda-gold mx-auto mb-4 opacity-50"></div>
                    <p className="text-pagoda-stone-500 font-light">We value your thoughts to improve our service.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* User Details Section - Updated */}
                    <GlassCard className="bg-white border border-pagoda-stone-100 p-8 shadow-sm">
                        <h2 className="text-xl font-medium text-pagoda-stone-700 mb-6 border-b border-pagoda-stone-100 pb-3">Your Details (Optional)</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-pagoda-stone-600 mb-2">Name</label>
                                <input
                                    type="text"
                                    className="input-field w-full bg-pagoda-stone-50/50 p-3 rounded-md border border-pagoda-stone-200 focus:outline-none focus:border-pagoda-gold"
                                    placeholder="Rahul"
                                    value={answers.name || ''}
                                    onChange={(e) => handleAnswer('name', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-pagoda-stone-600 mb-2">Email</label>
                                <input
                                    type="email"
                                    className="input-field w-full bg-pagoda-stone-50/50 p-3 rounded-md border border-pagoda-stone-200 focus:outline-none focus:border-pagoda-gold"
                                    placeholder="rahul@rahul.com"
                                    value={answers.email || ''}
                                    onChange={(e) => handleAnswer('email', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-pagoda-stone-600 mb-2">Contact Number</label>
                                <input
                                    type="tel"
                                    className="input-field w-full bg-pagoda-stone-50/50 p-3 rounded-md border border-pagoda-stone-200 focus:outline-none focus:border-pagoda-gold"
                                    placeholder="9876543210"
                                    value={answers.contact || ''}
                                    onChange={(e) => handleAnswer('contact', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-pagoda-stone-600 mb-2">Where are you from?</label>
                                <input
                                    type="text"
                                    className="input-field w-full bg-pagoda-stone-50/50 p-3 rounded-md border border-pagoda-stone-200 focus:outline-none focus:border-pagoda-gold"
                                    placeholder="Mumbai"
                                    value={answers.location || ''}
                                    onChange={(e) => handleAnswer('location', e.target.value)}
                                />
                            </div>
                        </div>
                    </GlassCard>

                    {department.questions.map((q, idx) => (
                        <GlassCard
                            key={q.id}
                            className="bg-white border border-pagoda-stone-100 p-8 shadow-sm"
                            delay={idx * 0.1}
                        >
                            <label className="block text-lg font-medium text-pagoda-stone-700 mb-6 text-center">
                                {q.text} {q.type !== 'text' && <span className="text-red-400">*</span>}
                            </label>

                            {q.type === 'smiley' && (
                                <RatingSmiley
                                    value={answers[q.id]}
                                    onChange={(val) => handleAnswer(q.id, val)}
                                    labels={q.labels}
                                />
                            )}

                            {q.type === 'rating_5' && (
                                <StarRating
                                    value={answers[q.id]}
                                    onChange={(val) => handleAnswer(q.id, val)}
                                // StarRating handles internal labels usually, but if needed we can upgrade it too. 
                                // For now sticking to standard Stars.
                                />
                            )}

                            {q.type === 'number_rating' && (
                                <NumberRating
                                    value={answers[q.id]}
                                    onChange={(val) => handleAnswer(q.id, val)}
                                    labels={q.labels}
                                />
                            )}

                            {q.type === 'option_select' && (
                                <OptionSelect
                                    value={answers[q.id]}
                                    onChange={(val) => handleAnswer(q.id, val)}
                                    options={q.options}
                                />
                            )}

                            {q.type === 'text' && (
                                <textarea
                                    rows={4}
                                    className="input-field resize-none bg-pagoda-stone-50/50"
                                    placeholder="Kindly share your thoughts..."
                                    value={answers[q.id] || ''}
                                    onChange={(e) => handleAnswer(q.id, e.target.value)}
                                />
                            )}
                        </GlassCard>
                    ))}

                    {submitError && (
                        <div className="flex items-center gap-2 text-pagoda-error bg-red-50 p-4 rounded-md justify-center font-medium border border-red-100">
                            <AlertCircle size={20} /> {submitError}
                        </div>
                    )}

                    <div className="pt-8 pb-12 flex justify-center">
                        <Button
                            type="submit"
                            disabled={submitting || !isFormValid}
                            className={`px-12 py-3 text-lg shadow-pagoda-gold/20 ${!isFormValid ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {submitting ? 'Submitting...' : (
                                <>Submit Feedback <Send size={18} /></>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FeedbackForm;
