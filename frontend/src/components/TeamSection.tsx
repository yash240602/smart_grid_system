import React from 'react';
import aaryaImage from '../assets/images/aarya.jpeg';
import yashImage from '../assets/images/yash.jpeg';
import yashrajImage from '../assets/images/yashraj.jpeg';

const TeamSection: React.FC = () => {
  const teamMembers = [
    {
      name: 'Yashraj Rai',
      role: 'Madhav Institute of Technology and Science, Gwalior',
      image: yashrajImage,
      contacts: [
        { type: 'email', value: 'yashrajrai1234@gmail.com', display: 'Email' },
        { type: 'github', value: 'https://github.com/yash1raj234', display: 'GitHub' },
        { type: 'phone', value: '+91 9770184915', display: 'Phone' }
      ]
    },
    {
      name: 'Yash Shrivastava',
      role: 'Madhav Institute of Technology and Science, Gwalior',
      image: yashImage,
      contacts: [
        { type: 'email', value: 'yash.shrivastava2406@gmail.com', display: 'Email' },
        { type: 'github', value: 'https://github.com/yash240602', display: 'GitHub' },
        { type: 'linkedin', value: 'https://www.linkedin.com/in/yash-shrivastava-/', display: 'LinkedIn' },
        { type: 'phone', value: '+91 6264546758', display: 'Phone' }
      ]
    },
    {
      name: 'Aarya Dubey',
      role: 'Madhav Institute of Technology and Science, Gwalior',
      image: aaryaImage,
      contacts: [
        { type: 'email', value: 'aarya.dubey0201@gmail.com', display: 'Email' },
        { type: 'github', value: 'https://github.com/Aaryadubey', display: 'GitHub' },
        { type: 'linkedin', value: 'https://www.linkedin.com/in/aarya-dubey/', display: 'LinkedIn' },
        { type: 'phone', value: '+91 8602341200', display: 'Phone' }
      ]
    }
  ];

  return (
    <div className="team-section">
      <h2 className="team-heading"><span className="team-icon">👥</span> Meet Our Team</h2>
      <p className="team-description">
        GridGenius was developed by a talented team of engineers and designers passionate about sustainable energy.
      </p>
      
      <div className="team-members">
        {teamMembers.map((member, index) => (
          <div key={index} className="member-card">
            <div className="member-photo-wrapper">
              <img src={member.image} alt={member.name} className="member-photo" />
            </div>
            
            <div className="member-info">
              <h3 className="member-name">{member.name}</h3>
              <p className="member-role">{member.role}</p>
              
              <div className="member-contact">
                {member.contacts.map((contact, contactIndex) => (
                  <React.Fragment key={contactIndex}>
                    {contactIndex > 0 && <span className="separator"> </span>}
                    <a
                      href={contact.type === 'email' ? `mailto:${contact.value}` : 
                           contact.type === 'phone' ? `tel:${contact.value.replace(/\D/g,'')}` : 
                           contact.value}
                      target={contact.type !== 'email' && contact.type !== 'phone' ? "_blank" : undefined}
                      rel={contact.type !== 'email' && contact.type !== 'phone' ? "noopener noreferrer" : undefined}
                      className={`contact-link ${contact.type}`}
                      title={contact.value}
                    >
                      {contact.type === 'github' && (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                      )}
                      {contact.type === 'linkedin' && (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                        </svg>
                      )}
                      {contact.type === 'email' && (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M0 3v18h24v-18h-24zm21.518 2l-9.518 7.713-9.518-7.713h19.036zm-19.518 14v-11.817l10 8.104 10-8.104v11.817h-20z"/>
                        </svg>
                      )}
                      {contact.type === 'phone' && (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20 22.621l-3.521-6.795c-.008.004-1.974.97-2.064 1.011-2.24 1.086-6.799-7.82-4.609-8.994l2.083-1.026-3.493-6.817-2.106 1.039c-7.202 3.755 4.233 25.982 11.6 22.615.121-.055 2.102-1.029 2.11-1.033z"/>
                        </svg>
                      )}
                    </a>
                  </React.Fragment>
                ))}
              </div>
              
              <div className="member-contact-info">
                {member.contacts.find(c => c.type === 'email') && (
                  <div className="contact-item">
                    <span className="contact-value">{member.contacts.find(c => c.type === 'email')?.value}</span>
                  </div>
                )}
                {member.contacts.find(c => c.type === 'phone') && (
                  <div className="contact-item">
                    <span className="contact-value">{member.contacts.find(c => c.type === 'phone')?.value}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>
        {`
          .team-section {
            background-color: var(--bg-secondary);
            padding: 2rem;
            border-radius: 8px;
            margin: 2rem 0;
          }
          
          .team-heading {
            font-size: 2rem;
            text-align: center;
            margin-bottom: 1rem;
            color: var(--text-primary);
          }
          
          .team-icon {
            margin-right: 0.5rem;
          }
          
          .team-description {
            text-align: center;
            max-width: 700px;
            margin: 0 auto 2rem auto;
            color: var(--text-secondary);
          }
          
          .team-members {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
          }
          
          .member-card {
            background-color: var(--bg-card);
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            transition: transform 0.3s, box-shadow 0.3s;
          }
          
          .member-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
          }
          
          .member-photo-wrapper {
            width: 120px;
            height: 120px;
            margin: 2rem auto 1rem auto;
            border-radius: 50%;
            overflow: hidden;
            border: 4px solid var(--accent-primary);
          }
          
          .member-photo {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          
          .member-info {
            padding: 1rem 2rem 2rem 2rem;
            text-align: center;
          }
          
          .member-name {
            font-size: 1.5rem;
            margin: 0 0 0.5rem 0;
            color: var(--text-primary);
          }
          
          .member-role {
            font-size: 0.9rem;
            margin: 0 0 1.5rem 0;
            color: var(--text-secondary);
            font-style: italic;
          }
          
          .member-contact {
            display: flex;
            justify-content: center;
            gap: 1rem;
            margin: 1rem 0;
            align-items: center;
          }
          
          .contact-link {
            color: var(--text-secondary);
            transition: color 0.2s, transform 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .contact-link:hover {
            color: var(--accent-primary);
            transform: scale(1.1);
          }
          
          .contact-link svg {
            width: 24px;
            height: 24px;
          }
          
          .separator {
            color: var(--text-muted);
            opacity: 0.5;
          }
          
          .member-contact-info {
            font-size: 0.9rem;
            color: var(--text-secondary);
            margin-top: 1rem;
            text-align: center;
            padding: 0 0.5rem;
          }
          
          .contact-item {
            display: flex;
            justify-content: center;
            margin-bottom: 0.5rem;
          }
          
          .contact-value {
            color: var(--text-primary);
          }
          
          @media (max-width: 768px) {
            .team-members {
              grid-template-columns: 1fr;
            }
            
            .member-card {
              max-width: 350px;
              margin: 0 auto;
            }
          }
        `}
      </style>
    </div>
  );
};

export default TeamSection; 