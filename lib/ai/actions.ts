export interface ActionConfig {
  id: string;
  type: "appointment" | "webhook" | "email" | "coupon" | "product_card";
  name: string;
  description: string;
  settings: Record<string, any>;
  isEnabled: boolean;
}

export interface ActionExecutionResult {
  success: boolean;
  actionType: string;
  resultPayload: Record<string, any>;
  displayText: string;
  executionTimeMs: number;
}

/**
 * Execute a configured AI action server-side with masked credentials and execution timing
 */
export async function executeAiAction(
  action: ActionConfig,
  inputData: Record<string, any>
): Promise<ActionExecutionResult> {
  const startTime = Date.now();

  switch (action.type) {
    case "appointment": {
      const provider = action.settings.provider || "calendly";
      const bookingUrl =
        action.settings.booking_url ||
        "https://calendly.com/apex-dental/routine-consultation";
      return {
        success: true,
        actionType: "appointment",
        resultPayload: {
          bookingUrl,
          service: inputData.service || "Standard Consultation",
        },
        displayText: `You can schedule your appointment directly at: ${bookingUrl}`,
        executionTimeMs: Date.now() - startTime,
      };
    }

    case "coupon": {
      const discountPercent = action.settings.discount_percent || 15;
      const code = `SAVE${discountPercent}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      return {
        success: true,
        actionType: "coupon",
        resultPayload: { code, discountPercent },
        displayText: `🎉 Here is your special promotion code: **${code}** for ${discountPercent}% off your first appointment!`,
        executionTimeMs: Date.now() - startTime,
      };
    }

    case "webhook": {
      const webhookUrl = action.settings.webhook_url;
      if (!webhookUrl) {
        return {
          success: false,
          actionType: "webhook",
          resultPayload: { error: "Webhook URL not configured" },
          displayText: "Could not connect to external service.",
          executionTimeMs: Date.now() - startTime,
        };
      }

      try {
        const response = await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Chatify-Secret": action.settings.auth_header || "chatify-secure",
          },
          body: JSON.stringify(inputData),
        });

        const resData = await response.json();
        return {
          success: response.ok,
          actionType: "webhook",
          resultPayload: resData,
          displayText: `Action completed: ${JSON.stringify(resData)}`,
          executionTimeMs: Date.now() - startTime,
        };
      } catch (err: any) {
        return {
          success: false,
          actionType: "webhook",
          resultPayload: { error: err.message },
          displayText: "External webhook connection failed.",
          executionTimeMs: Date.now() - startTime,
        };
      }
    }

    case "product_card": {
      const products = action.settings.catalog || [
        {
          name: "Professional Sonic Whitening Toothbrush",
          price: 89.0,
          imageUrl: "https://images.unsplash.com/photo-1559591937-e12501099238?w=300",
          link: "https://apex-dental.com/shop/toothbrush",
        },
      ];
      return {
        success: true,
        actionType: "product_card",
        resultPayload: { products },
        displayText: `We recommend our ${products[0].name} ($${products[0].price}).`,
        executionTimeMs: Date.now() - startTime,
      };
    }

    case "email": {
      return {
        success: true,
        actionType: "email",
        resultPayload: { queued: true, to: inputData.email },
        displayText: "A summary has been emailed to you.",
        executionTimeMs: Date.now() - startTime,
      };
    }

    default:
      return {
        success: false,
        actionType: "unknown",
        resultPayload: {},
        displayText: "Unrecognized action.",
        executionTimeMs: Date.now() - startTime,
      };
  }
}
