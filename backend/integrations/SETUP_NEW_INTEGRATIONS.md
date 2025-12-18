# Setup Guide for 7 New FREE Premium Integrations

## Quick Start

### Step 1: Get Your FREE API Keys

#### 1. Pexels API
1. Visit: https://www.pexels.com/api/
2. Click "Get Started"
3. Sign up with email
4. Copy your API key
5. **Free Tier:** 200 requests/hour

#### 2. NewsAPI
1. Visit: https://newsapi.org/register
2. Fill registration form
3. Verify email
4. Copy API key from dashboard
5. **Free Tier:** 100 requests/day

#### 3. ExchangeRate API
1. Visit: https://www.exchangerate-api.com/
2. Click "Get Free Key"
3. Enter email
4. Check email for API key
5. **Free Tier:** 1,500 requests/month

#### 4. IPGeolocation
1. Visit: https://ipgeolocation.io/signup.html
2. Create free account
3. Verify email
4. Get API key from dashboard
5. **Free Tier:** 1,000 requests/day

#### 5. AbstractAPI
1. Visit: https://app.abstractapi.com/users/signup
2. Sign up for free
3. Navigate to each API you want:
   - Email Validation
   - Phone Validation
   - IP Geolocation
   - VAT Validation
   - Holidays
   - Exchange Rates
   - Timezone
   - Web Scraping
4. Get individual API keys
5. **Free Tier:** 100 requests/month per API

#### 6. RapidAPI
1. Visit: https://rapidapi.com/auth/sign-up
2. Create account
3. Go to "My Apps"
4. Copy your API key
5. Browse 40,000+ APIs
6. **Free Tier:** 500 requests/month

#### 7. Freelancer.com API
1. Visit: https://www.freelancer.com/api/register
2. Create developer account
3. Create new application
4. Get OAuth credentials
5. Generate access token
6. **Free Tier:** 1,000 requests/day

---

### Step 2: Configure Environment Variables

Create or update your `.env` file in the backend directory:

```env
# Pexels
PEXELS_API_KEY=your_pexels_key_here

# NewsAPI
NEWSAPI_KEY=your_newsapi_key_here

# ExchangeRate
EXCHANGERATE_API_KEY=your_exchangerate_key_here

# IPGeolocation
IPGEOLOCATION_API_KEY=your_ipgeolocation_key_here

# AbstractAPI (Multiple keys for different services)
ABSTRACTAPI_EMAIL_KEY=your_email_validation_key
ABSTRACTAPI_PHONE_KEY=your_phone_validation_key
ABSTRACTAPI_IPGEO_KEY=your_ipgeo_key
ABSTRACTAPI_VAT_KEY=your_vat_key
ABSTRACTAPI_HOLIDAYS_KEY=your_holidays_key
ABSTRACTAPI_EXCHANGE_KEY=your_exchange_key
ABSTRACTAPI_TIMEZONE_KEY=your_timezone_key
ABSTRACTAPI_WEBSCRAPING_KEY=your_webscraping_key

# RapidAPI
RAPIDAPI_KEY=your_rapidapi_key_here

# Freelancer.com
FREELANCER_ACCESS_TOKEN=your_freelancer_token_here
```

---

### Step 3: Install Dependencies

```bash
cd backend/integrations
npm install axios
```

---

### Step 4: Test Each Integration

Create a test file `test-integrations.js`:

```javascript
require('dotenv').config();

// Import all integrations
const PexelsIntegration = require('./pexels-premium');
const NewsAPIIntegration = require('./newsapi-premium');
const ExchangeRateIntegration = require('./exchangerate-premium');
const IPGeolocationIntegration = require('./ipgeolocation-premium');
const AbstractAPIIntegration = require('./abstractapi-premium');
const RapidAPIIntegration = require('./rapidapi-hub');
const FreelancerAPIIntegration = require('./freelancer-api');

async function testIntegrations() {
  console.log('🧪 Testing New Integrations...\n');

  // Test Pexels
  try {
    const pexels = new PexelsIntegration(process.env.PEXELS_API_KEY);
    const photos = await pexels.searchPhotos('nature', 5);
    console.log('✅ Pexels:', photos.success ? 'Working' : 'Failed');
  } catch (error) {
    console.log('❌ Pexels:', error.message);
  }

  // Test NewsAPI
  try {
    const news = new NewsAPIIntegration(process.env.NEWSAPI_KEY);
    const headlines = await news.getTopHeadlines('us', null, null, null, 5);
    console.log('✅ NewsAPI:', headlines.success ? 'Working' : 'Failed');
  } catch (error) {
    console.log('❌ NewsAPI:', error.message);
  }

  // Test ExchangeRate
  try {
    const exchange = new ExchangeRateIntegration(process.env.EXCHANGERATE_API_KEY);
    const rates = await exchange.getLatestRates('USD');
    console.log('✅ ExchangeRate:', rates.success ? 'Working' : 'Failed');
  } catch (error) {
    console.log('❌ ExchangeRate:', error.message);
  }

  // Test IPGeolocation
  try {
    const ipGeo = new IPGeolocationIntegration(process.env.IPGEOLOCATION_API_KEY);
    const location = await ipGeo.getIPGeolocation();
    console.log('✅ IPGeolocation:', location.success ? 'Working' : 'Failed');
  } catch (error) {
    console.log('❌ IPGeolocation:', error.message);
  }

  // Test AbstractAPI
  try {
    const abstract = new AbstractAPIIntegration({
      email: process.env.ABSTRACTAPI_EMAIL_KEY,
      phone: process.env.ABSTRACTAPI_PHONE_KEY,
      ipGeo: process.env.ABSTRACTAPI_IPGEO_KEY
    });
    const emailCheck = await abstract.validateEmail('test@example.com');
    console.log('✅ AbstractAPI:', emailCheck.success ? 'Working' : 'Failed');
  } catch (error) {
    console.log('❌ AbstractAPI:', error.message);
  }

  // Test RapidAPI
  try {
    const rapid = new RapidAPIIntegration(process.env.RAPIDAPI_KEY);
    const weather = await rapid.getWeather('London');
    console.log('✅ RapidAPI:', weather.success ? 'Working' : 'Failed');
  } catch (error) {
    console.log('❌ RapidAPI:', error.message);
  }

  // Test Freelancer
  try {
    const freelancer = new FreelancerAPIIntegration(process.env.FREELANCER_ACCESS_TOKEN);
    const projects = await freelancer.searchProjects(null, null, null, null, 5);
    console.log('✅ Freelancer:', projects.success ? 'Working' : 'Failed');
  } catch (error) {
    console.log('❌ Freelancer:', error.message);
  }

  console.log('\n✨ Testing Complete!');
}

testIntegrations();
```

Run the test:
```bash
node test-integrations.js
```

---

### Step 5: Integration Examples

#### Example 1: Get Stock Photos for Your App
```javascript
const pexels = new PexelsIntegration(process.env.PEXELS_API_KEY);

// Search for specific photos
const photos = await pexels.searchPhotos('technology', 20, 1, 'landscape');

// Use in your app
photos.photos.forEach(photo => {
  console.log(`Photo: ${photo.url}`);
  console.log(`Download: ${photo.src.original}`);
});
```

#### Example 2: Display Latest News
```javascript
const news = new NewsAPIIntegration(process.env.NEWSAPI_KEY);

// Get tech news
const techNews = await news.getTechnologyNews('us', 10);

// Display headlines
techNews.articles.forEach(article => {
  console.log(`${article.title}`);
  console.log(`Source: ${article.source.name}`);
  console.log(`URL: ${article.url}\n`);
});
```

#### Example 3: Currency Converter
```javascript
const exchange = new ExchangeRateIntegration(process.env.EXCHANGERATE_API_KEY);

// Convert USD to multiple currencies
const amount = 100;
const result = await exchange.convertCurrency('USD', 'EUR', amount);

console.log(`${amount} USD = ${result.result} EUR`);
console.log(`Exchange Rate: ${result.rate}`);
```

#### Example 4: Validate User Input
```javascript
const abstract = new AbstractAPIIntegration({
  email: process.env.ABSTRACTAPI_EMAIL_KEY,
  phone: process.env.ABSTRACTAPI_PHONE_KEY
});

// Validate email
const emailCheck = await abstract.validateEmail('user@example.com', true);
if (emailCheck.isValid) {
  console.log('✅ Valid email');
  if (emailCheck.suggestion) {
    console.log(`Suggestion: ${emailCheck.suggestion}`);
  }
}

// Validate phone
const phoneCheck = await abstract.validatePhone('+1234567890', 'US');
if (phoneCheck.isValid) {
  console.log('✅ Valid phone');
  console.log(`Carrier: ${phoneCheck.carrier}`);
}
```

#### Example 5: Find Freelance Projects
```javascript
const freelancer = new FreelancerAPIIntegration(process.env.FREELANCER_ACCESS_TOKEN);

// Search for web development projects
const projects = await freelancer.searchProjects(
  'web development',
  ['javascript', 'react', 'nodejs'],
  100,
  5000,
  20
);

// Display projects
projects.projects.forEach(project => {
  console.log(`Project: ${project.title}`);
  console.log(`Budget: $${project.budget.minimum} - $${project.budget.maximum}`);
  console.log(`Bids: ${project.bid_stats.bid_count}\n`);
});
```

---

## Rate Limits Summary

| Integration | Free Tier Limit | Upgrade Available |
|------------|----------------|-------------------|
| Pexels | 200/hour | Yes |
| NewsAPI | 100/day | Yes |
| ExchangeRate | 1,500/month | Yes |
| IPGeolocation | 1,000/day | Yes |
| AbstractAPI | 100/month per API | Yes |
| RapidAPI | 500/month | Yes |
| Freelancer | 1,000/day | Yes |

---

## Troubleshooting

### Common Issues:

1. **"Invalid API Key" Error**
   - Double-check your API key in `.env`
   - Ensure no extra spaces
   - Verify key is active in provider dashboard

2. **"Rate Limit Exceeded"**
   - Check your usage in provider dashboard
   - Implement caching to reduce requests
   - Consider upgrading to paid tier

3. **"Network Error"**
   - Check internet connection
   - Verify API endpoint is accessible
   - Check if service is down (status page)

4. **"Module Not Found"**
   - Run `npm install axios`
   - Check file paths are correct

---

## Best Practices

1. **Cache Responses**
   - Store frequently accessed data
   - Reduce API calls
   - Improve performance

2. **Error Handling**
   - Always wrap API calls in try-catch
   - Provide fallback data
   - Log errors for debugging

3. **Rate Limiting**
   - Implement request queuing
   - Track usage
   - Set up alerts

4. **Security**
   - Never commit API keys
   - Use environment variables
   - Rotate keys regularly

---

## Support

For issues with specific integrations:
- **Pexels:** https://help.pexels.com/
- **NewsAPI:** https://newsapi.org/docs
- **ExchangeRate:** https://www.exchangerate-api.com/docs
- **IPGeolocation:** https://ipgeolocation.io/documentation
- **AbstractAPI:** https://www.abstractapi.com/api
- **RapidAPI:** https://docs.rapidapi.com/
- **Freelancer:** https://developers.freelancer.com/

---

## Next Steps

1. ✅ Get all API keys
2. ✅ Configure environment variables
3. ✅ Test each integration
4. ✅ Integrate into your R3SN app
5. ✅ Monitor usage and performance
6. ✅ Scale as needed

**All 7 integrations are production-ready and FREE to use!** 🚀
