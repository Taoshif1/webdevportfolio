// ============================================
// GEMINI AI CHATBOT
// ============================================

// API Configuration - Uses GEMINI_API_KEY from config.js
// If config.js is not loaded, fallback to direct key (for development)
const API_KEY = typeof GEMINI_API_KEY !== 'undefined' ? GEMINI_API_KEY : 'AIzaSyBMwwE6wZ7H2EoA6eR7pF0lid2YmAzPIeY';
const API_URL = typeof GEMINI_API_URL !== 'undefined' ? GEMINI_API_URL : 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

const myFullName = "Gazi Taoshif";

// Rate limiting and request management
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 15000; // 15 seconds between requests
let isRateLimited = false;
let rateLimitResetTime = 0;
const myDescription = `I'm Gazi Taoshif, a passionate MERN Stack Developer & aspiring entrepreneur from Bangladesh. My coding journey started 2 years ago & since then, I've been fascinated by the power of turning ideas into real, impactful solutions.

I specialize in building full-stack applications using MongoDB, Express.js, React & Node.js, creating seamless user experiences and tackling complex problems with smart solutions.

Skills: HTML, CSS, Bootstrap 5, JavaScript, JSON, jQuery, SASS, TypeScript, React.js, Tailwind CSS, Node.js, Express.js, MongoDB, REST API, PHP, C, C++, Java, Python, Git & GitHub, Networking, GSAP, Three.js, Framer Motion.

Outside of coding, I enjoy playing cricket, exploring new technologies, sketching digital art & continuously leveling up my skills in tech, business & personal branding.

My goal is to build projects that create value, collaborate with talented individuals & shape a future where technology drives meaningful impact. I'm the founder of Taoshiflex Venture.

Education:
- Bachelor of Science in Computer Science & Engineering (2023-2027) at East West University
- Higher Secondary Certificate (HSC) 2020-2023, GPA: 5.0/5.0
- Secondary School Certificate (SSC) 2010-2020, GPA: 5.0/5.0

Contact: taoshif2@gmail.com, +880 1760972307, Dhaka, Bangladesh`;

let chatHistory = [];

// ============================================
// GSAP ANIMATIONS
// ============================================

function initChatAnimations() {
  const chatBubble = document.getElementById('chat-bubble');
  const chatOverlay = document.getElementById('chat-overlay');
  const chatWindow = chatOverlay ? chatOverlay.querySelector('.chat-window') : null;

  if (!chatBubble || !chatOverlay || !chatWindow) {
    console.warn('Chat elements not found');
    return;
  }

  // Check if GSAP is available
  if (typeof gsap === 'undefined') {
    console.warn('GSAP not loaded, using CSS animations');
    // Fallback: use CSS for floating animation
    chatBubble.style.animation = 'float 2s ease-in-out infinite';
    return;
  }

  // Floating animation for chat bubble
  gsap.to(chatBubble, {
    y: -10,
    duration: 2,
    ease: "power1.inOut",
    yoyo: true,
    repeat: -1,
  });

  // Initial state - chat overlay hidden
  gsap.set(chatOverlay, { opacity: 0 });
  gsap.set(chatWindow, { scale: 0 });

  // Open chat animation
  window.openChat = function() {
    if (!chatOverlay || !chatWindow) return;
    
    chatOverlay.classList.remove('hidden');
    chatOverlay.style.display = 'flex';
    
    gsap.to(chatOverlay, {
      opacity: 1,
      duration: 0.3,
      ease: "power2.out",
    });
    gsap.to(chatWindow, {
      scale: 1,
      duration: 0.5,
      ease: "back.out(1.7)",
    });
    
    // Focus input after animation
    setTimeout(() => {
      const inputField = document.getElementById('chat-input-field');
      if (inputField) inputField.focus();
    }, 100);
  };

  // Close chat animation
  window.closeChat = function() {
    if (!chatOverlay || !chatWindow) return;
    
    gsap.to(chatWindow, {
      scale: 0,
      duration: 0.3,
      ease: "back.in(1.7)",
    });
    gsap.to(chatOverlay, {
      opacity: 0,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => {
        chatOverlay.classList.add('hidden');
        chatOverlay.style.display = 'none';
      },
    });
  };
}

// ============================================
// MESSAGE ANIMATIONS
// ============================================

function animateMessage(messageElement, isReceived = false) {
  gsap.from(messageElement, {
    y: 20,
    opacity: 0,
    duration: 0.4,
    ease: "power2.out",
  });
}

// ============================================
// TYPING INDICATOR
// ============================================

function showTypingIndicator() {
  const indicator = document.getElementById('typing-indicator');
  if (!indicator) return;

  indicator.classList.remove('hidden');
  const dots = indicator.querySelectorAll('.typing-dot');
  
  dots.forEach((dot, index) => {
    gsap.to(dot, {
      y: -8,
      duration: 0.6,
      ease: "power2.inOut",
      yoyo: true,
      repeat: -1,
      delay: index * 0.2,
    });
  });
}

function hideTypingIndicator() {
  const indicator = document.getElementById('typing-indicator');
  if (!indicator) return;

  const dots = indicator.querySelectorAll('.typing-dot');
  dots.forEach((dot) => {
    gsap.killTweensOf(dot);
    gsap.set(dot, { y: 0 });
  });

  indicator.classList.add('hidden');
}

// ============================================
// SEND MESSAGE
// ============================================

// Helper function to check if we can make a request (exported for use in form handler)
window.canMakeRequest = function() {
  const now = Date.now();
  
  // Check if we're still rate limited
  if (isRateLimited && now < rateLimitResetTime) {
    const secondsLeft = Math.ceil((rateLimitResetTime - now) / 1000);
    return { canMake: false, message: `Rate limit: Please wait ${secondsLeft} second${secondsLeft > 1 ? 's' : ''} before trying again.` };
  }
  
  // Reset rate limit flag if time has passed
  if (isRateLimited && now >= rateLimitResetTime) {
    isRateLimited = false;
  }
  
  // Check minimum interval between requests
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const waitTime = Math.ceil((MIN_REQUEST_INTERVAL - timeSinceLastRequest) / 1000);
    return { canMake: false, message: `Please wait ${waitTime} second${waitTime > 1 ? 's' : ''} before sending another message.` };
  }
  
  return { canMake: true };
};

// Retry function with exponential backoff (but don't retry on 429 - respect rate limits)
async function retryRequest(fetchFunction, maxRetries = 2, baseDelay = 1000) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fetchFunction();
    } catch (error) {
      // Don't retry on 429 errors - respect rate limits immediately
      if (error.status === 429) {
        throw error; // Throw immediately, don't retry
      }
      
      // Only retry on network errors or server errors (5xx), not rate limits
      if (error.status >= 500 && attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`Server error. Retrying in ${delay}ms... (Attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // For other errors, throw immediately
      throw error;
    }
  }
}

async function sendMessage(userMessage) {
  const chatMessages = document.getElementById('chat-messages');
  if (!chatMessages) return;

  // Check if we can make a request
  const requestCheck = window.canMakeRequest();
  if (!requestCheck.canMake) {
    // Show rate limit message
    const rateLimitDiv = document.createElement('div');
    rateLimitDiv.className = 'message received flex justify-start';
    rateLimitDiv.innerHTML = `
      <div class="message-content bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3 max-w-[80%] text-yellow-300">
        <p>${requestCheck.message}</p>
      </div>
    `;
    chatMessages.appendChild(rateLimitDiv);
    animateMessage(rateLimitDiv, true);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return;
  }

  // Update last request time
  lastRequestTime = Date.now();

  // Add user message
  const userMessageDiv = document.createElement('div');
  userMessageDiv.className = 'message sent flex justify-end';
  userMessageDiv.innerHTML = `
    <div class="message-content bg-[#c9a961] rounded-lg p-3 max-w-[80%] text-[#121212]">
      <p>${userMessage}</p>
    </div>
  `;
  chatMessages.appendChild(userMessageDiv);
  animateMessage(userMessageDiv, false);

  // Scroll to bottom
  chatMessages.scrollTop = chatMessages.scrollHeight;

  // Show typing indicator
  showTypingIndicator();

  // Clear input
  const inputField = document.getElementById('chat-input-field');
  if (inputField) inputField.value = '';

  try {
    // Add to chat history
    chatHistory.push({
      role: 'user',
      parts: [{ text: userMessage }],
    });

    // Prepare context
    const systemContext = `You are ${myFullName}. ${myDescription}

Instructions:
- Respond naturally as Gazi Taoshif would
- Use short, conversational sentences
- Be friendly and professional
- Answer questions about your skills, projects, and background
- Keep responses concise (2-3 sentences max)`;

    // Call Gemini API with retry logic
    const response = await retryRequest(async () => {
      const fetchResponse = await fetch(
        `${API_URL}?key=${API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: `${systemContext}\n\nUser: ${userMessage}\n\nYou (as Gazi Taoshif):` }],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 200,
            },
          }),
        }
      );

      // Handle rate limiting - don't retry, just throw immediately
      if (fetchResponse.status === 429) {
        // Extract retry-after header if available, or use minimum interval
        const retryAfter = fetchResponse.headers.get('retry-after');
        const retrySeconds = retryAfter ? parseInt(retryAfter) : Math.ceil(MIN_REQUEST_INTERVAL / 1000);
        
        // Set rate limit state immediately
        isRateLimited = true;
        rateLimitResetTime = Date.now() + (retrySeconds * 1000);
        
        // Also update lastRequestTime to prevent immediate retry
        lastRequestTime = Date.now();
        
        const error = new Error(`API error: ${fetchResponse.status}`);
        error.status = 429;
        error.retryAfter = retrySeconds;
        throw error; // Throw immediately, no retry
      }

      if (!fetchResponse.ok) {
        const error = new Error(`API error: ${fetchResponse.status}`);
        error.status = fetchResponse.status;
        error.response = fetchResponse; // Store response for debugging
        throw error;
      }

      return fetchResponse;
    });

    const data = await response.json();
    let aiResponse = '';

    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      aiResponse = data.candidates[0].content.parts[0].text;
    } else {
      aiResponse = "I apologize, but I'm having trouble processing that right now. Could you please rephrase your question?";
    }

    // Hide typing indicator
    hideTypingIndicator();

    // Add AI response
    const aiMessageDiv = document.createElement('div');
    aiMessageDiv.className = 'message received flex justify-start';
    aiMessageDiv.innerHTML = `
      <div class="message-content bg-white/5 backdrop-blur-sm rounded-lg p-3 max-w-[80%] text-gray-300">
        <p>${aiResponse}</p>
      </div>
    `;
    chatMessages.appendChild(aiMessageDiv);
    animateMessage(aiMessageDiv, true);

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Add to chat history
    chatHistory.push({
      role: 'model',
      parts: [{ text: aiResponse }],
    });

  } catch (error) {
    console.error('Error sending message:', error);
    
    // Hide typing indicator even on error
    hideTypingIndicator();

    // Show appropriate error message based on error type
    let errorMessage = '';
    let errorColor = 'red';
    
    if (error.status === 429) {
      // Rate limit error
      const retrySeconds = error.retryAfter || 60;
      errorMessage = `Too many requests! The API is rate-limited. Please wait ${retrySeconds} seconds before trying again.`;
      errorColor = 'yellow';
      
      // Set rate limit state
      isRateLimited = true;
      rateLimitResetTime = Date.now() + (retrySeconds * 1000);
    } else if (error.status === 400) {
      errorMessage = 'Invalid request. Please check your message and try again.';
    } else if (error.status === 401) {
      errorMessage = 'Authentication error. Please check the API key configuration.';
    } else if (error.status === 403) {
      errorMessage = 'Access forbidden. The API key may not have the required permissions.';
    } else if (error.status >= 500) {
      errorMessage = 'Server error. The API is temporarily unavailable. Please try again in a few moments.';
    } else {
      errorMessage = 'Sorry, I\'m having trouble connecting right now. Please try again later.';
    }

    const errorMessageDiv = document.createElement('div');
    errorMessageDiv.className = 'message received flex justify-start';
    const bgColor = errorColor === 'yellow' ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300' : 'bg-red-500/20 border-red-500/50 text-red-300';
    errorMessageDiv.innerHTML = `
      <div class="message-content ${bgColor} border rounded-lg p-3 max-w-[80%]">
        <p>${errorMessage}</p>
      </div>
    `;
    chatMessages.appendChild(errorMessageDiv);
    animateMessage(errorMessageDiv, true);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
}

// ============================================
// INITIALIZE CHATBOT
// ============================================

function initChatbot() {
  // Wait for GSAP to be available
  if (typeof gsap === 'undefined') {
    console.error('GSAP is not loaded');
    return;
  }

  // Initialize GSAP animations
  initChatAnimations();

  // Chat bubble click
  const chatBubble = document.getElementById('chat-bubble');
  if (chatBubble) {
    chatBubble.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (typeof openChat === 'function') {
        openChat();
      }
    });
  } else {
    console.warn('Chat bubble not found');
  }

  // Close button
  const closeBtn = document.getElementById('chat-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (typeof closeChat === 'function') {
        closeChat();
      }
    });
  }

  // Overlay click to close
  const chatOverlay = document.getElementById('chat-overlay');
  if (chatOverlay) {
    chatOverlay.addEventListener('click', (e) => {
      if (e.target === chatOverlay) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof closeChat === 'function') {
          closeChat();
        }
      }
    });
  }

  // Form submission
  const chatForm = document.getElementById('chat-form');
  const sendButton = chatForm ? chatForm.querySelector('button[type="submit"]') : null;
  
  if (chatForm) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const inputField = document.getElementById('chat-input-field');
      if (inputField && inputField.value.trim()) {
        // Check rate limit before sending
        const requestCheck = window.canMakeRequest();
        if (!requestCheck.canMake) {
          // Show warning but don't send
          return;
        }
        
        // Disable send button temporarily
        if (sendButton) {
          sendButton.disabled = true;
          sendButton.textContent = 'Sending...';
          setTimeout(() => {
            if (sendButton) {
              sendButton.disabled = false;
              sendButton.textContent = 'Send';
            }
          }, 1000); // Brief disable, actual rate limiting is handled by canMakeRequest
        }
        
        sendMessage(inputField.value.trim());
      }
    });
  }
  
  // Update send button state based on rate limit
  function updateSendButtonState() {
    if (!sendButton) return;
    
    const requestCheck = window.canMakeRequest();
    if (!requestCheck.canMake && isRateLimited) {
      const secondsLeft = Math.ceil((rateLimitResetTime - Date.now()) / 1000);
      if (secondsLeft > 0) {
        sendButton.disabled = true;
        sendButton.textContent = `Wait ${secondsLeft}s`;
        sendButton.classList.add('opacity-50', 'cursor-not-allowed');
      } else {
        sendButton.disabled = false;
        sendButton.textContent = 'Send';
        sendButton.classList.remove('opacity-50', 'cursor-not-allowed');
      }
    } else {
      sendButton.disabled = false;
      sendButton.textContent = 'Send';
      sendButton.classList.remove('opacity-50', 'cursor-not-allowed');
    }
  }
  
  // Update button state periodically when rate limited
  setInterval(updateSendButtonState, 1000);

  // Enter key to send
  const inputField = document.getElementById('chat-input-field');
  if (inputField) {
    inputField.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (chatForm) {
          chatForm.dispatchEvent(new Event('submit'));
        }
      }
    });
  }
}

// Initialize when DOM and GSAP are ready
function initializeChatbotWhenReady() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      // Wait a bit for GSAP to be fully loaded
      setTimeout(initChatbot, 100);
    });
  } else {
    // DOM is ready, wait for GSAP
    if (typeof gsap !== 'undefined') {
      setTimeout(initChatbot, 100);
    } else {
      // Wait for GSAP to load
      window.addEventListener('load', () => {
        setTimeout(initChatbot, 100);
      });
    }
  }
}

initializeChatbotWhenReady();

