import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

// --- RENDER BACKEND URL ---
const API_BASE_URL = 'https://ramana-backend-automail-3hnf.onrender.com';

function App() {
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  
  // Form State
  const [userName, setUserName] = useState(''); // <-- ADDED SENDER NAME STATE
  const [userEmail, setUserEmail] = useState('');
  const [to, setTo] = useState('');
  const [cc, setCc] = useState('');   
  const [bcc, setBcc] = useState(''); 
  const [subject, setSubject] = useState('');
  const [text, setText] = useState('');
  
  const [files, setFiles] = useState<File[]>([]); 
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('refreshToken');
    if (token) {
      setRefreshToken(token);
      window.history.replaceState({}, document.title, "/"); 
    }
  }, []);

  const handleLogin = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/auth/url`);
      window.location.href = res.data.url; 
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (files.length + newFiles.length > 10) {
        alert("You can only attach a maximum of 10 files.");
        return;
      }
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    }
  };

  const removeFile = (indexToRemove: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, index) => index !== indexToRemove));
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refreshToken) return alert("Please log in first!");

    // We no longer strictly reject based on commas since the backend parses messy strings,
    // but we can still do a basic check. The backend will enforce the final 10-person limit.
    if (!text || text === '<p><br></p>') {
      return alert("Please enter a message!");
    }

    setIsLoading(true); 
    setStatus("Sending emails...");
    
    const formData = new FormData();
    formData.append('userName', userName); // <-- ADDED TO FORMDATA
    formData.append('userEmail', userEmail);
    formData.append('to', to);
    formData.append('cc', cc);   
    formData.append('bcc', bcc); 
    formData.append('subject', subject);
    formData.append('text', text); 
    formData.append('refreshToken', refreshToken);

    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      const res = await axios.post(`${API_BASE_URL}/send-mail`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setStatus("✅ " + res.data); 
      
      setTo('');
      setCc('');
      setBcc('');
      setSubject('');
      setText(''); 
      setFiles([]); 
      
    } catch (error: any) {
      const errorMsg = error.response?.data || "Failed to send emails. Check console.";
      setStatus(`❌ ${errorMsg}`);
      console.error(error);
    } finally {
      setIsLoading(false); 
    }
  };

  const styles = {
    page: {
      minHeight: '100vh',
      backgroundColor: '#f3f4f6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    card: {
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)',
      padding: '40px',
      width: '100%',
      maxWidth: '650px', // slightly wider to accommodate text areas nicely
    },
    header: {
      textAlign: 'center' as const,
      marginBottom: '30px',
      color: '#111827',
      fontSize: '28px',
      fontWeight: '700'
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column' as const,
      marginBottom: '16px'
    },
    label: {
      marginBottom: '6px',
      fontSize: '14px',
      fontWeight: '600',
      color: '#374151'
    },
    input: {
      padding: '12px',
      borderRadius: '8px',
      border: '1px solid #d1d5db',
      fontSize: '15px',
      color: '#1f2937',
      outline: 'none',
      transition: 'border-color 0.2s',
      boxSizing: 'border-box' as const,
      width: '100%'
    },
    textarea: {
      padding: '12px',
      borderRadius: '8px',
      border: '1px solid #d1d5db',
      fontSize: '14px',
      color: '#1f2937',
      outline: 'none',
      transition: 'border-color 0.2s',
      boxSizing: 'border-box' as const,
      width: '100%',
      minHeight: '70px',
      resize: 'vertical' as const,
      fontFamily: 'inherit'
    },
    primaryButton: {
      backgroundColor: '#2563eb',
      color: '#ffffff',
      border: 'none',
      borderRadius: '8px',
      padding: '14px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      width: '100%',
      marginTop: '10px',
      transition: 'background-color 0.2s'
    },
    googleButton: {
      backgroundColor: '#ffffff',
      color: '#374151',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      padding: '14px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
    },
    statusMessage: {
      marginTop: '20px',
      padding: '12px',
      borderRadius: '8px',
      backgroundColor: status.includes('✅') ? '#dcfce7' : status.includes('❌') ? '#fee2e2' : '#f3f4f6',
      color: status.includes('✅') ? '#166534' : status.includes('❌') ? '#991b1b' : '#374151',
      fontSize: '14px',
      fontWeight: '500',
      textAlign: 'center' as const
    },
    fileList: {
      marginTop: '10px',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '8px'
    },
    fileItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#f9fafb',
      padding: '8px 12px',
      borderRadius: '6px',
      border: '1px solid #e5e7eb',
      fontSize: '13px',
      color: '#4b5563'
    },
    removeBtn: {
      background: 'none',
      border: 'none',
      color: '#ef4444',
      cursor: 'pointer',
      fontWeight: 'bold',
      fontSize: '14px'
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.header}>Bulk Mail Sender</h1>
        
        {!refreshToken ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#4b5563', marginBottom: '24px', lineHeight: '1.5' }}>
              Connect your Google Workspace or personal Gmail account to start sending personalized bulk emails securely.
            </p>
            <button onClick={handleLogin} style={styles.googleButton}>
              <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          </div>
        ) : (
          <form onSubmit={handleSend}>
            
            {/* ADDED: SENDER NAME AND EMAIL ROW */}
            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ ...styles.formGroup, flex: 1 }}>
                <label style={styles.label}>Sender Name</label>
                <input required type="text" style={styles.input} value={userName} onChange={e => setUserName(e.target.value)} placeholder="e.g., Ramana Automail" />
              </div>
              <div style={{ ...styles.formGroup, flex: 1 }}>
                <label style={styles.label}>Sender Address</label>
                <input required type="email" style={styles.input} value={userEmail} onChange={e => setUserEmail(e.target.value)} placeholder="name@jozuna.com" />
              </div>
            </div>

            {/* UPDATED: CHANGED TO TEXTAREA FOR EASY PASTING */}
            <div style={styles.formGroup}>
              <label style={styles.label}>To <span style={{color: '#9ca3af', fontWeight: 'normal'}}>(Max 10, paste list or comma separated)</span></label>
              <textarea required style={styles.textarea} value={to} onChange={e => setTo(e.target.value)} placeholder={'Paste email list here. E.g.:\nRavina Sri <ravinasri@jozuna.com>\nshradha@jozuna.com'} />
            </div>
            
            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ ...styles.formGroup, flex: 1 }}>
                <label style={styles.label}>CC <span style={{color: '#9ca3af', fontWeight: 'normal'}}>(Optional)</span></label>
                <textarea style={styles.textarea} value={cc} onChange={e => setCc(e.target.value)} placeholder="Paste CC list here..." />
              </div>

              <div style={{ ...styles.formGroup, flex: 1 }}>
                <label style={styles.label}>BCC <span style={{color: '#9ca3af', fontWeight: 'normal'}}>(Optional)</span></label>
                <textarea style={styles.textarea} value={bcc} onChange={e => setBcc(e.target.value)} placeholder="Paste BCC list here..." />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Subject</label>
              <input required type="text" style={styles.input} value={subject} onChange={e => setSubject(e.target.value)} placeholder="Enter email subject" />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Message</label>
              <div style={{ backgroundColor: 'white', marginBottom: '40px', height: '200px' }}>
                <ReactQuill 
                  theme="snow" 
                  value={text} 
                  onChange={setText} 
                  style={{ height: '100%' }}
                  placeholder="Type your formatted message here..."
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Attachments <span style={{color: '#9ca3af', fontWeight: 'normal'}}>(Optional)</span></label>
              <input type="file" multiple style={{...styles.input, padding: '8px'}} onChange={handleFileChange} />
              
              {files.length > 0 && (
                <div style={styles.fileList}>
                  {files.map((file, index) => (
                    <div key={index} style={styles.fileItem}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        📄 {file.name}
                      </span>
                      <button type="button" onClick={() => removeFile(index)} style={styles.removeBtn} title="Remove file">
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" style={{...styles.primaryButton, opacity: isLoading ? 0.7 : 1}} disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Send Bulk Emails'}
            </button>

            {status && (
              <div style={styles.statusMessage}>
                {status}
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

export default App;
