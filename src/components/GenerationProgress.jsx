import React from 'react';

const GenerationProgress = ({ progress }) => {
  return (
    <div className="workspace-box">
      <div className="text-center">
        <h3 className="mb-4" style={{color:'#a78bfa', letterSpacing:'1px'}}>Generating Your Music</h3>
        <div className="d-flex flex-column align-items-center justify-content-center" style={{gap: '0.5rem'}}>
          {/* Progress percent in a circle badge */}
          <div style={{
            background:'#181c2a',
            color:'#a78bfa',
            border:'2px solid #a78bfa',
            borderRadius:'50%',
            width:'3.2rem',
            height:'3.2rem',
            display:'flex',
            alignItems:'center',
            justifyContent:'center',
            fontWeight:700,
            fontSize:'1.3rem',
            marginTop:'0.5rem',
            marginBottom:'0.5rem',
            boxShadow:'0 0 8px #a78bfa44'
          }}>{progress}%</div>
          {/* Custom progress bar */}
          <div style={{width: '100%', maxWidth: 400, height: '1.1rem', background:'#23263a', borderRadius:8, overflow:'hidden', marginBottom:8, boxShadow:'0 1px 6px #0002'}}>
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #a78bfa 0%, #6366f1 100%)',
                borderRadius:8,
                transition:'width 0.4s cubic-bezier(.4,2,.6,1)',
                boxShadow:'0 0 8px #a78bfa55'
              }}
            />
          </div>
          <div className="fw-semibold mt-2" style={{color:'#a78bfa', fontSize:'1rem', letterSpacing:'0.5px'}}>
            Hang tight! Your music is being created. This may take 2-3 minutes.
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerationProgress;

