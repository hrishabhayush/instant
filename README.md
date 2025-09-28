# Instant

Instant is a Chrome browser extension that revolutionizes how people shop from social media content. It uses advanced AI vision technology to analyze Instagram reels in real-time, automatically identifying clothing and fashion items worn by creators and instantly finding similar products across major e-commerce platforms (including those in India!). Users can purchase these items using cryptocurrency, creating a seamless bridge between spontaneous inspiration and actual shopping.

We built Instant on Polygon’s x402 payment framework, enabling micropayments between AI agents and seamless conversion after users connect with non-custodial wallet authentication. We also integrated SerpAPI across Amazon, Google Shopping, Myntra, and other local marketplaces with rate limiting for performance optimization. The frontend (extension) leverages real-time video frame capture using HTML5 Canvas API to extract Instagram reel frames, as well as context menu integration and pop-up UI windows for user state management. The backend consists of an image processing pipeline. After capturing video frames, we convert them to Base64 and send them to OpenAI GPT-4 Vision API with custom prompts for structured item extraction. 

## Setup 

### Cloning the repository 

```bash
git clone https://github.com/hrishabhayush/primer-2.0.git
cd primer-2.0
pnpm install
```

### Backend 

```bash
cd apps/backend
pnpm install
pnpm start
```

Starting the chrome extension 

Load unpack the extension folder which is all written in javascript. 
