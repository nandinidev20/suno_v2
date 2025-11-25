import React from 'react';

const GenerationResults = ({ result, onViewProfile, onGenerateAnother }) => {
  console.log('GenerationResults:', result);
  if (!result) return null;

  return (
    <div className="workspace-box">
      <div className="text-center">
        <h3>Generation Complete!</h3>

        {result?.album_cover_path && (
          <div className="mt-4">
            <img
              src={result.album_cover_path}
              width={200}
              alt="Album Thumbnail"
              className="w-60 h-60 rounded shadow border border-white/20 object-cover mx-auto"
            />
          </div>
        )}

        {(result?.conversion_path_1 || result?.conversion_path_wav_1) && (
          <div className="mt-4">
            <audio
              controls
              className="w-full max-w-md mx-auto"
              src={result?.conversion_path_1 || result?.conversion_path_wav_1}
            />
          </div>
        )}

        <div className="mt-4 space-y-2 text-sm">
          <p><strong>Prompt:</strong> {result?.description_prompt}</p>
          <p><strong>Style:</strong> {result?.music_style}</p>
          {result && (
            <>
              <p><strong>Status:</strong> {result.status}</p>
              {/* {result.conversion_cost_user !== undefined && (
                <p><strong>Cost:</strong> ${result.conversion_cost_user}</p>
              )}
              {result.conversion_duration !== undefined && (
                <p><strong>Duration (s):</strong> {result.conversion_duration}</p>
              )} */}
            </>
          )}
        </div>

        <div className="mt-6 space-x-3">
          <button onClick={onViewProfile} className="btn-gradient">
            View in Profile
          </button>
          <button onClick={onGenerateAnother} className="btn-normal grey-bg">
            Generate Another
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenerationResults;

