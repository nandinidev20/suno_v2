import '../plan-blocks.css';

const MembershipSubPlan = ({ currentPlanId, onUpgrade, loadingPlan, plans, isAuthenticated, onCancel }) => {

  if (!plans || plans.length === 0) return null;
  const currentPlanIndex = plans.findIndex(p => p.id === currentPlanId);

  return (
    <section className="price-section section-padding" style={{padding:'0px'}}>
      <div className="container">
        <h2>NO SUBSCRIPTION..NO CREDITS</h2>
        <p>ONE TIME PAYMENT..FULL ACCESS</p>
        <div className="pricing" style={{gap:'17px', marginTop:'0px'}}>
          {/* Dynamic Paid Plans */}
          {plans.map((plan, idx) => {
            const hasCurrentPlan = !!currentPlanId;
            const isCurrent = hasCurrentPlan && plan.id === currentPlanId;
            const isLower = hasCurrentPlan && currentPlanIndex !== -1 && idx < currentPlanIndex;
            const planNameLower = plan.name ? plan.name.toLowerCase() : '';
            let planClass = `plan ${plan.id === 'basic' ? 'green' : ''} ${plan.id === 'pro' ? 'pro' : ''}`;
            let planStyle = {};
            if (isCurrent) {
              planClass += ' active-plan';
              planStyle = {
                border: '2.5px solid #2ecc40',
                boxShadow: '0 0 0 4px #2ecc4033',
              };
            } else {
              planStyle = {
                backgroundImage: `url('/img/price-bg.jpg')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              };
            }
            return (
              <div
                key={plan.id}
                className={planClass}
                style={planStyle}
              >
                <div className="plan-box">
                  <h3>{plan.name.toUpperCase()} {isCurrent && <span style={{color:'green'}}>(Current)</span>}</h3>
                  <p className={plan.id === 'basic' ? 'black-font' : 'grey-font'}>{plan.description}</p>
                  <div className="price">${plan.price}{plan.plan_type !== 'lifetime'}</div>
                </div>
                {/* Button logic: */}
                {!hasCurrentPlan ? (
                  // No plan: all plans available
                  <button
                    onClick={() => onUpgrade(plan.id)}
                    disabled={loadingPlan === plan.id}
                    className="btn"
                  >
                    {loadingPlan === plan.id ? 'Processing...' : (isAuthenticated ? 'Upgrade' : 'Get Started')}
                  </button>
                ) : isCurrent ? (
                  // Current plan: show cancel if allowed
                  <>
                    <button className="btn" disabled>Current Plan</button>
                    {(planNameLower === 'basic' || planNameLower === 'pro') && onCancel && (
                      <button
                        onClick={onCancel}
                        className="btn btn-danger mt-2"
                        style={{marginLeft: 8}}
                        disabled={loadingPlan === 'cancel'}
                      >
                        {loadingPlan === 'cancel' ? 'Processing...' : 'Cancel Plan'}
                      </button>
                    )}
                  </>
                ) : isLower ? (
                  // Lower plans: not available
                  <button className="btn" disabled>Not Available</button>
                ) : (
                  // Higher plans: upgrade available
                  <button
                    onClick={() => onUpgrade(plan.id)}
                    disabled={loadingPlan === plan.id}
                    className="btn"
                  >
                    {loadingPlan === plan.id ? 'Processing...' : (isAuthenticated ? 'Upgrade' : 'Get Started')}
                  </button>
                )}
                {/* <p className={plan.plan_type === 'basic' ? '' : 'grey-font'}>
                  ${plan.price} per user /  {plan.plan_type === 'lifetime' || plan.plan_type === 'pro' ? 'Lifetime access' : 'Monthly plan'}
                </p> */}

                <p className={plan.plan_type === 'basic' ? '' : 'grey-font'}>
                  ${plan.price} per user / Lifetime access
                </p>

                <ul className={plan.plan_type === 'basic' ? 'basic' : plan.plan_type === 'pro' ? 'pro' : ''}>
                  <li>
                      {
                        plan.plan_type === 'pro' ? 'Pro AI Generations speeds 3x' : 
                        plan.plan_type === 'lifetime' ? 'Priority Export speeds 10x' : `Basic AI generations speeds`
                      }
                  </li>
                  <li>
                    {
                      plan.plan_type === 'pro' ? '(Pro Quality) Export Stems' : 
                      plan.plan_type === 'lifetime' ? '(High Quality) Export Stems' : 'Export Stems (Base, Drums Keys Etc)' 
                    }
                  </li>
                  <li>
                    {
                      plan.plan_type === 'pro' ? 'Commercial use' : 
                      plan.plan_type === 'lifetime' ? 'Commercial use' : 'Commercial use' 
                    }
                  </li>
                  <li>
                     {
                      plan.plan_type === 'pro' ? 'Remix/Cover Generations' : 
                      plan.plan_type === 'lifetime' ? 'Remix/Cover Generations' : 'Remix/Cover Generations' 
                     }
                  </li>
                  <li>
                    {
                      plan.plan_type === 'pro' ? 'Unilimited AI Generations' : 
                      plan.plan_type === 'lifetime' ? 'Unilimited AI Generations' : 'Unilimited AI Generations' 
                    }
                  </li>

                   {/* <li style={plan.plan_type !== 'lifetime' ? {display:'none'} : {}}>
                    {
                      plan.plan_type === 'lifetime' ? 'Unlimited AI song generations' : '' 
                    }
                  </li> */}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default MembershipSubPlan;
