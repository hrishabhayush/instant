import React, { useState, useEffect } from 'react';

const Options = () => {
  const [settings, setSettings] = useState({
    theme: 'light',
    notifications: true,
    autoSave: false
  });

  useEffect(() => {
    // Load saved settings
    chrome.storage.sync.get(['theme', 'notifications', 'autoSave'], (result) => {
      setSettings({
        theme: result.theme || 'light',
        notifications: result.notifications !== false,
        autoSave: result.autoSave === true
      });
    });
  }, []);

  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    // Save to Chrome storage
    chrome.storage.sync.set({ [key]: value });
  };

  return (
    <div className="options-container">
      <div className="header">
        <h1>Primer Extension Settings</h1>
        <p>Customize your extension experience</p>
      </div>

      <div className="settings-section">
        <div className="setting-item">
          <label htmlFor="theme">Theme</label>
          <select
            id="theme"
            value={settings.theme}
            onChange={(e) => handleSettingChange('theme', e.target.value)}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="auto">Auto</option>
          </select>
        </div>

        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={settings.notifications}
              onChange={(e) => handleSettingChange('notifications', e.target.checked)}
            />
            Enable Notifications
          </label>
        </div>

        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={settings.autoSave}
              onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
            />
            Auto Save
          </label>
        </div>
      </div>

      <div className="footer">
        <p>Settings are automatically saved to your browser.</p>
      </div>
    </div>
  );
};

export default Options;
