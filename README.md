# Portfolio - Gazi Taoshif

A modern, award-winning portfolio website featuring a Gemini AI chatbot integration.

## Features

- **Silent Luxury Design**: Clean, minimal aesthetic with premium typography
- **GSAP Animations**: Subtle micro-interactions and smooth transitions
- **Three.js Background**: Subtle wireframe background animation
- **Gemini AI Chatbot**: Interactive AI assistant powered by Google's Gemini 2.0 Flash
- **Responsive Design**: Fully responsive across all devices
- **Performance Optimized**: Fast loading and smooth scrolling

## Setup

### API Key Configuration

1. The chatbot uses Google's Gemini API. The API key is stored in `config.js`.
2. **Important**: For production, add `config.js` to `.gitignore` to keep your API key secure.
3. The API key is currently set in `config.js` for development purposes.

### Environment Variables (Optional)

If you're using a build tool like Vite or Next.js, you can use environment variables:

- Create a `.env` file in the root directory
- Add: `VITE_GEMINI_API_KEY=your_api_key_here` (for Vite)
- Or: `NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here` (for Next.js)

## File Structure

```
portfolio/
├── index.html          # Main HTML file
├── styles.css          # Custom styles
├── script.js           # Main JavaScript (Three.js, GSAP, etc.)
├── chatbot.js          # Gemini AI chatbot logic
├── config.js           # API configuration (add to .gitignore)
├── .gitignore          # Git ignore file
├── images/             # Image assets
└── public/             # Public files (resume, etc.)
```

## Chatbot Features

- **Floating Animation**: Chat bubble has a subtle floating GSAP animation
- **Smooth Open/Close**: Chat overlay scales with back.out easing
- **Message Animations**: Messages slide up and fade in with stagger effect
- **Typing Indicator**: Animated bouncing dots while AI is responding
- **Custom Scrollbar**: Themed scrollbar matching portfolio design
- **Error Handling**: Graceful error handling with user-friendly messages

## Technologies Used

- HTML5, CSS3
- Tailwind CSS
- JavaScript (ES6+)
- GSAP 3.12.5
- Three.js r128
- Google Gemini API 2.0 Flash
- Lenis (Smooth Scroll)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Personal portfolio project.
