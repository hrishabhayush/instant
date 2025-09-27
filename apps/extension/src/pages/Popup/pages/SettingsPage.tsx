import React from 'react';
import { useNavigate } from 'react-router-dom';

interface SettingsPageProps {
  svgAssets: any;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ svgAssets }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/');
  };

  const handleSaveSettings = () => {
    // In a real app, this would save settings
    console.log('Settings saved');
  };

  return (
    <div style={{
      width: '375px', 
      height: '600px', 
      background: '#000000', 
      color: 'white', 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
      display: 'flex',
      flexDirection: 'column',
      margin: 0,
      padding: 0,
      overflow: 'hidden',
    }}>
      {/* Header with back button */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 20px',
        flexShrink: 0,
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      }}>
        <button 
          onClick={handleBack}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '16px',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '4px',
            transition: 'background 0.2s ease',
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'none'}
        >
          ← Back
        </button>
        <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Settings</h1>
        <div style={{ width: '40px' }}></div>
      </div>

      {/* Settings Content */}
      <div style={{
        padding: '20px',
        flex: 1,
        overflowY: 'auto',
      }}>
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ 
            margin: '0 0 12px 0', 
            fontSize: '16px', 
            fontWeight: 600, 
            color: 'white' 
          }}>
            Notifications
          </h3>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '12px',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)' }}>
                Product alerts
              </span>
              <input 
                type="checkbox" 
                defaultChecked 
                style={{ 
                  width: '20px', 
                  height: '20px',
                  accentColor: '#4A9EFF'
                }} 
              />
            </div>
          </div>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            padding: '16px',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)' }}>
                Price drop notifications
              </span>
              <input 
                type="checkbox" 
                defaultChecked 
                style={{ 
                  width: '20px', 
                  height: '20px',
                  accentColor: '#4A9EFF'
                }} 
              />
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ 
            margin: '0 0 12px 0', 
            fontSize: '16px', 
            fontWeight: 600, 
            color: 'white' 
          }}>
            Privacy
          </h3>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '12px',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)' }}>
                Share usage data
              </span>
              <input 
                type="checkbox" 
                style={{ 
                  width: '20px', 
                  height: '20px',
                  accentColor: '#4A9EFF'
                }} 
              />
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ 
            margin: '0 0 12px 0', 
            fontSize: '16px', 
            fontWeight: 600, 
            color: 'white' 
          }}>
            About
          </h3>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            padding: '16px',
          }}>
            <div style={{ marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>
                Version: 1.0.0
              </span>
            </div>
            <div>
              <span style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>
                Built with ❤️ by Primerpay
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div style={{
        padding: '20px',
        flexShrink: 0,
      }}>
        <button 
          onClick={handleSaveSettings}
          style={{
            width: '100%',
            background: '#4A9EFF',
            color: 'white',
            border: 'none',
            padding: '16px',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#3A8EEF'}
          onMouseOut={(e) => e.currentTarget.style.background = '#4A9EFF'}
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
