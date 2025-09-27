// Create Instagram "Instant" button injection
const createInstagramButton = () => {
  // Check if we're on Instagram
  if (!window.location.hostname.includes('instagram.com')) {
    return;
  }

  console.log('Creating Instagram Instant button...');

  // Function to find and inject the button
  const injectButton = () => {
    // Look for Instagram section container with the new selector
    const targetSection = document.querySelector('#mount_0_0_tV > div > div > div.x9f619.x1n2onr6.x1ja2u2z > div > div > div.x78zum5.xdt5ytf.x1t2pt76.x1n2onr6.x1ja2u2z.x10cihs4 > div.html-div.xdj266r.x14z9mp.xat24cr.x1lziwak.xexx8yu.xyri2b.x18d9i69.x1c1uobl.x9f619.x16ye13r.xvbhtw8.x78zum5.x15mokao.x1ga7v0g.x16uus16.xbiv7yw.x1uhb9sk.x1plvlek.xryxfnj.x1c4vz4f.x2lah0s.x1q0g3np.xqjyukv.x1qjc9v5.x1oa3qoh.x1qughib > div.xvc5jky.xh8yej3.x10o80wk.x14k21rp.x17snn68.x6osk4m.x1porb0y.x8vgawa > section > main > div.x1qjc9v5.x78zum5.x1q0g3np.xl56j7k.xh8yej3 > div > div > div.html-div.xdj266r.x14z9mp.xat24cr.x1lziwak.xexx8yu.xyri2b.x18d9i69.x1c1uobl.x9f619.xjbqb8w.x78zum5.x15mokao.x1ga7v0g.x16uus16.xbiv7yw.x1uhb9sk.x1plvlek.xryxfnj.x1c4vz4f.x2lah0s.xdt5ytf.xqjyukv.x6s0dn4.x1oa3qoh.x1nhvcw1 > div > div:nth-child(1) > div > article:nth-child(1) > div > div.x1lliihq.x1n2onr6 > div > div > section.x6s0dn4.xrvj5dj.x1o61qjw.x12nagc.x1gslohp');
    
    if (!targetSection) {
      console.log('Primary section not found, trying fallback selectors...');
      // Try more generic selectors for Instagram action sections
      const fallbackSelectors = [
        'section[role="main"] section',
        'article section',
        'div[role="button"] svg[aria-label*="Save"]',
        'svg[aria-label*="Save"], svg[aria-label*="save"]'
      ];
      
      let fallbackElement = null;
      for (const selector of fallbackSelectors) {
        fallbackElement = document.querySelector(selector);
        if (fallbackElement) {
          console.log(`Found section with selector: ${selector}`);
          break;
        }
      }
      
      if (!fallbackElement) {
        console.log('No Instagram action section found on this page');
        return;
      }
    }

    // Check if button already exists
    if (document.getElementById('primer-instant-button')) {
      return;
    }

    // Use the found section or fallback
    const actionContainer = targetSection || document.querySelector('section[role="main"] section');
    if (!actionContainer) {
      console.log('No action container found');
      return;
    }

    console.log('Action container found:', actionContainer);

    // Create the Instant button
    const instantButton = document.createElement('button');
    instantButton.id = 'primer-instant-button';
    instantButton.textContent = 'Instant';
    instantButton.style.cssText = `
      background: #4A9EFF;
      color: white;
      border: none;
      padding: 8px 32px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      min-width: 120px;
      margin-right: 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      transition: all 0.2s ease;
      z-index: 1000;
      position: relative;
    `;

    // Add hover effect
    instantButton.addEventListener('mouseenter', () => {
      instantButton.style.background = '#3A8EEF';
      instantButton.style.transform = 'scale(1.02)';
    });

    instantButton.addEventListener('mouseleave', () => {
      instantButton.style.background = '#4A9EFF';
      instantButton.style.transform = 'scale(1)';
    });

    // Add click handler
    instantButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      console.log('Instant button clicked!');
      
      // Send message to background script
      chrome.runtime.sendMessage({
        action: 'instantCapture',
        url: window.location.href,
        timestamp: new Date().toISOString()
      });

      // Visual feedback
      instantButton.textContent = 'Captured!';
      instantButton.style.background = '#28a745';
      setTimeout(() => {
        instantButton.textContent = 'Instant';
        instantButton.style.background = '#4A9EFF';
      }, 2000);
    });

    // Insert the button into the action section
    if (actionContainer) {
      // Try to find the action buttons area within the section (like, comment, share, save)
      const actionButtonsContainer = actionContainer.querySelector('div[style*="flex"], div[class*="flex"]') || 
                                    actionContainer.querySelector('div > div') ||
                                    actionContainer;
      
      // Insert button at the beginning (leftmost position)
      if (actionButtonsContainer.firstChild) {
        actionButtonsContainer.insertBefore(instantButton, actionButtonsContainer.firstChild);
        console.log('Instant button injected successfully at the beginning of action container');
      } else {
        actionButtonsContainer.appendChild(instantButton);
        console.log('Instant button injected successfully (appended to container)');
      }
    }
  };

  // Try to inject immediately
  injectButton();

  // Also watch for page changes (Instagram is a SPA)
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(() => {
      if (!document.getElementById('primer-instant-button')) {
        setTimeout(injectButton, 1000); // Delay to let Instagram load
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
};

// Wait for DOM to be ready and inject Instagram button
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createInstagramButton);
} else {
  createInstagramButton();
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getPageInfo') {
    sendResponse({
      title: document.title,
      url: window.location.href,
      domain: window.location.hostname
    });
  }
});
