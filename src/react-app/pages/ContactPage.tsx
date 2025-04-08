import React, { useState } from 'react';

// Define types for form state
interface ContactFormState {
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
}

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormState>({
    name: '',
    email: '',
    category: '',
    subject: '',
    message: ''
  });
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [submissionMessage, setSubmissionMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset status on new submission attempt
    if (submissionStatus === 'success' || submissionStatus === 'error') {
      setSubmissionStatus('idle');
      setSubmissionMessage('');
    }
    
    // Form validation
    if (!formData.email || !formData.category || !formData.message) {
      setSubmissionStatus('error');
      setSubmissionMessage('Please fill in all required fields.');
      return;
    }

    setSubmissionStatus('submitting');
    console.log('Submitting form:', formData);
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubmissionStatus('success');
      setSubmissionMessage('Your message has been sent successfully! We\'ll get back to you soon.');
      setFormData({
        name: '',
        email: '',
        category: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      setSubmissionStatus('error');
      setSubmissionMessage('Failed to send your message. Please try again or use direct email.');
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-header">
        <h1>Get in Touch</h1>
        <p>We're here to help with any questions you might have</p>
      </div>

      <div className="contact-container">
        <div className="contact-info">
          <h2>Contact Information</h2>
          <p>Feel free to reach out using the form or contact us directly using the information below.</p>
          
          <div className="contact-method">
            <div className="contact-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="contact-details">
              <h3>Email Us</h3>
              <p>For general inquiries:</p>
              <a href="mailto:contact@sesh-tracker.com" className="contact-link">contact@sesh-tracker.com</a>
              <p>For business proposals:</p>
              <a href="mailto:business@sesh-tracker.com" className="contact-link">business@sesh-tracker.com</a>
              <p>For bug reports:</p>
              <a href="mailto:support@sesh-tracker.com" className="contact-link">support@sesh-tracker.com</a>
            </div>
          </div>

          <div className="contact-method">
            <div className="contact-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="contact-details">
              <h3>Response Time</h3>
              <p>We typically respond to all inquiries within 24-48 hours during business days.</p>
            </div>
          </div>
        </div>

        <div className="contact-form-wrapper">
          <h2>Send a Message</h2>
          
          {/* Status Messages */}
          {submissionStatus === 'success' && (
            <div className="form-success">
              {submissionMessage}
            </div>
          )}
          
          {submissionStatus === 'error' && (
            <div className="form-error">
              {submissionMessage}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="form-select"
                >
                  <option value="" disabled>Select a category</option>
                  <option value="general">General Inquiry</option>
                  <option value="bug">Bug Report</option>
                  <option value="feature">Feature Request</option>
                  <option value="business">Business Proposal</option>
                  <option value="support">Customer Support</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  placeholder="What's your message about?"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="message">Message *</label>
              <textarea
                id="message"
                name="message"
                rows={6}
                placeholder="Your message here..."
                value={formData.message}
                onChange={handleInputChange}
                required
                className="form-textarea"
              />
            </div>
            
            <div className="form-actions">
              <button 
                type="submit"
                className="submit-button"
                disabled={submissionStatus === 'submitting'}
              >
                {submissionStatus === 'submitting' ? (
                  <span className="button-content">
                    <span className="spinner"></span>
                    Sending...
                  </span>
                ) : (
                  <span className="button-content">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="button-icon">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Send Message
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage; 
