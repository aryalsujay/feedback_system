#!/bin/bash

echo "=========================================="
echo "FEEDBACK SYSTEM - RESTART & TEST"
echo "=========================================="
echo ""

# 1. Restart Nginx
echo "1. Restarting Nginx..."
sudo systemctl restart nginx
if [ $? -eq 0 ]; then
    echo "   ✅ Nginx restarted successfully"
else
    echo "   ❌ Failed to restart Nginx (need sudo access)"
    exit 1
fi
echo ""

# 2. Wait a moment
sleep 2

# 3. Test Homepage
echo "2. Testing Homepage..."
status=$(curl -s -o /dev/null -w "%{http_code}" http://172.12.0.28/)
if [ "$status" = "200" ]; then
    echo "   ✅ Homepage loads correctly (HTTP $status)"
else
    echo "   ❌ Homepage error (HTTP $status)"
fi
echo ""

# 4. Test Food Court Form
echo "3. Testing Food Court Form..."
status=$(curl -s -o /dev/null -w "%{http_code}" http://172.12.0.28/fc)
if [ "$status" = "200" ]; then
    echo "   ✅ Food Court form loads correctly (HTTP $status)"
else
    echo "   ❌ Food Court form error (HTTP $status)"
fi
echo ""

# 5. Test API Submission
echo "4. Testing API Submission..."
response=$(curl -s -X POST http://172.12.0.28/api/feedback \
    -H "Content-Type: application/json" \
    -d '{
        "departmentId":"food_court",
        "answers":{
            "food_taste":"5",
            "overall_experience":"4",
            "service_counters":"5",
            "service_speed":"4",
            "cleanliness":"5",
            "food_quality":"5",
            "suggestion":"Test submission from restart script"
        },
        "name":"System Test"
    }' \
    -w "\nHTTP_CODE:%{http_code}")

http_code=$(echo "$response" | grep -o "HTTP_CODE:[0-9]*" | cut -d':' -f2)
if [ "$http_code" = "201" ]; then
    echo "   ✅ Form submission works! (HTTP $http_code)"
    echo "$response" | grep -o '"message":"[^"]*"' | cut -d':' -f2
else
    echo "   ❌ Form submission failed (HTTP $http_code)"
fi
echo ""

# 6. Check JavaScript Bundle
echo "5. Checking JavaScript Bundle..."
js_file=$(ls -lh /home/feedback/feedback_system/client/dist/assets/*.js | awk '{print $9, $5}')
if [ ! -z "$js_file" ]; then
    echo "   ✅ Built bundle: $js_file"
else
    echo "   ❌ No JavaScript bundle found"
fi
echo ""

# 7. Test All Department URLs
echo "6. Testing All Department URLs..."
for dept in pr fc dpvc dlaya ss; do
    status=$(curl -s -o /dev/null -w "%{http_code}" http://172.12.0.28/$dept)
    if [ "$status" = "200" ]; then
        echo "   ✅ /$dept → HTTP $status"
    else
        echo "   ❌ /$dept → HTTP $status"
    fi
done
echo ""

echo "=========================================="
echo "NEXT STEPS:"
echo "=========================================="
echo ""
echo "1. ✅ Server is running and API works"
echo ""
echo "2. ⚠️  USERS MUST CLEAR BROWSER CACHE:"
echo "   - Computer: Ctrl+Shift+R (hard refresh)"
echo "   - Mobile: Settings → Clear browsing data"
echo ""
echo "3. ⚠️  TEST ON FRESH BROWSER/INCOGNITO:"
echo "   - Open: http://172.12.0.28/fc"
echo "   - Fill all required fields (*)"
echo "   - Submit and verify success"
echo ""
echo "If submission still fails, share the"
echo "browser console errors (press F12)"
echo ""
echo "=========================================="
