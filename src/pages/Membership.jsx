import { useEffect, useState } from "react";
import { stripeAPI } from "../utils/api";
import toast from "react-hot-toast";

import LeftSideBar from "../components/LeftSideBar";
import { useAuth } from "../contexts/AuthContext";
import MembershipSubPlan from "../components/MembershipSubPlan";

const Membership = () => {
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPlan, setLoadingPlan] = useState(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchAll();
    // Listen for payment success in URL and always refresh subscription
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    if (sessionId) {
      stripeAPI.handlePaymentSuccess(sessionId)
        .then(() => {
          fetchAll();
        })
        .catch(() => {
          toast.error('Failed to activate subscription. Please contact support.');
        });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [subRes, plansRes] = await Promise.all([
        stripeAPI.getSubscriptionStatus(),
        stripeAPI.getPlans()
      ]);
      if (subRes.data.success) setSubscription(subRes.data.subscription);
      if (plansRes.data.success) setPlans(plansRes.data.plans);
    } catch (e) {
      toast.error("Failed to fetch membership info");
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planType) => {
    setLoadingPlan(planType);
    try {
      const res = await stripeAPI.upgradePlan(planType);
      if (res.data.success && res.data.url) {
        window.location.href = res.data.url;
      } else {
        toast.error(res.data.message || "Failed to upgrade plan");
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to upgrade plan");
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleCancel = async () => {
    setLoadingPlan('cancel');
    try {
      const res = await stripeAPI.cancelPlan();
      if (res.data.success) {
        toast.success("Subscription will be canceled at period end");
        fetchAll();
      } else {
        toast.error(res.data.message || "Failed to cancel subscription");
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to cancel subscription");
    } finally {
      setLoadingPlan(null);
    }
  };

  console.log('Membership plans:', subscription);
  
  return (
    <section className="discover-section position-relative">
      <div className="container-fluid">
        <div className="discover-div d-flex">
          {/* Sidebar */}
          <LeftSideBar/>

          {/* Main Content */}
          <div className="main flex-grow-1 p-3">
            {/* Topbar */}
            <div className="topbar d-flex justify-content-between align-items-center mb-4">
              <div className="left-buttons">
                 <h1>My Membership</h1>
              </div>
            </div>
            {/* Membership Info Section */}
            <div className="card bg-dark text-white border-secondary mb-4">
              <div className="card-body">
                {subscription?.plan ? (
                  <>
                    <p><b>Current Plan:</b> {subscription.plan.name}</p>
                    <p><b>Songs used:</b> {subscription.songsUsed}</p>
                    
                    {/* {subscription.nextBillingDate && (() => {
                      const date = new Date(subscription.nextBillingDate);
                      const day = date.getDate().toString().padStart(2, '0');
                      const month = date.toLocaleString('default', { month: 'short' });
                      const year = date.getFullYear();
                      return (
                         <>
                          {subscription.plan.plan_type === 'basic' && (
                            <p><b>Next billing date:</b> {`${day}-${month}-${year}`}</p>
                          )}
                        </>
                      );
                    })()} */}

                    {/* Plan Features */}
                    <ul style={{marginTop: '12px', marginBottom: '0', paddingLeft: '18px', fontSize: '1rem'}}>
                      <li>
                        {
                          subscription.plan.plan_typ === 'pro' ? 'Pro AI Generations speeds' : 
                          subscription.plan.plan_typ === 'lifetime' ? 'Priority Export speeds' : `Basic AI generations speeds`
                        }
                      </li>
                      <li>
                        {
                          subscription.plan.plan_type === 'pro' ? '(Pro Quality) Export Stems' : 
                          subscription.plan.plan_type === 'lifetime' ? '(High Quality) Export Stems' : 'Export Stems (Base, Drums Keys Etc)' 
                        }
                      </li>
                      <li>
                        {
                          subscription.plan.plan_type === 'pro' ? 'Commercial use' : 
                          subscription.plan.plan_type === 'lifetime' ? 'Commercial use' : 'Commercial use' 
                        }
                      </li>
                      <li>
                         {
                          subscription.plan.plan_type === 'pro' ? 'Remix/Cover Generations' : 
                          subscription.plan.plan_type === 'lifetime' ? 'Remix/Cover Generations' : 'Remix/Cover Generations' 
                        }
                      </li>
                      <li>
                         {
                          subscription.plan.plan_type === 'pro' ? 'Unilimited AI Generations' : 
                          subscription.plan.plan_type === 'lifetime' ? 'Unilimited AI Generations' : 'Unilimited AI Generations' 
                        }
                      </li>
                    </ul>
                     {/* {subscription.plan.plan_type === 'basic' && (
                         <button onClick={handleCancel} className="btn btn-danger mt-3">Cancel Plan</button>
                     )} */}
                  </>
                ) : (
                  <p>No active membership plan.</p>
                )}
              </div>
            </div>

            {/* Plans Section */}
            <div className="card bg-dark text-white border-secondary mb-4">
              <div className="card-body">
                <MembershipSubPlan
                  currentPlanId={subscription?.plan?.id}
                  onUpgrade={handleUpgrade}
                  loadingPlan={loadingPlan}
                  plans={plans}
                  isAuthenticated={isAuthenticated}
                  onCancel={handleCancel}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Membership;
