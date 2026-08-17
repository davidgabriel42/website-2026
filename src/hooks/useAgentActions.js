import { useNavigate } from 'react-router-dom';

export function useAgentActions() {
  const navigate = useNavigate();

  const executeActions = (actions) => {
    if (!actions || !Array.isArray(actions)) return;

    actions.forEach((act) => {
      const { action, payload } = act;
      if (!action || !payload) return;

      console.log(`[Agent Action Dispatcher] Executing tool: ${action}`, payload);

      switch (action) {
        case "NAVIGATE":
          // Trigger React Router navigation
          navigate(payload);
          break;

        case "OPEN_PDF":
          // Open PDF CV or Documents in a new tab
          window.open(payload, '_blank', 'noopener,noreferrer');
          break;

        case "HIGHLIGHT":
          // Dynamically query the element in the DOM and apply a beautiful highlighting pulse effect
          try {
            // Support simple text searches or raw selector strings
            let element = null;
            if (payload.includes(":contains")) {
              // Parse simple contains match: button:contains('Solve') -> find button containing 'Solve'
              const match = payload.match(/(\w+):contains\('([^']+)'\)/);
              if (match) {
                const tag = match[1];
                const text = match[2];
                const elements = Array.from(document.querySelectorAll(tag));
                element = elements.find((el) => el.textContent.trim().toLowerCase().includes(text.toLowerCase()));
              }
            } else {
              element = document.querySelector(payload);
            }

            if (element) {
              // Apply temporary highlight styling
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              
              // Apply pulse highlight classes
              element.classList.add('ring-4', 'ring-primary', 'animate-pulse');
              
              // Remove highlight after a few seconds
              setTimeout(() => {
                element.classList.remove('ring-4', 'ring-primary', 'animate-pulse');
              }, 4000);
            } else {
              console.warn(`[Agent Action Dispatcher] Element not found matching selector: ${payload}`);
            }
          } catch (err) {
            console.error("[Agent Action Dispatcher] Highlight execution failed:", err);
          }
          break;

        default:
          console.warn(`[Agent Action Dispatcher] Unknown action type: ${action}`);
          break;
      }
    });
  };

  return { executeActions };
}
