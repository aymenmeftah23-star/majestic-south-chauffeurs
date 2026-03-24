/**
 * Email Notification Service
 * Handles all email notifications for Majestic South Chauffeurs
 */

export interface EmailNotification {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}

/**
 * Email templates for different events
 */
export const EMAIL_TEMPLATES = {
  // New demand received
  NEW_DEMAND: {
    subject: 'Nouvelle demande reçue - Majestic South Chauffeurs',
    template: 'new-demand',
    variables: ['clientName', 'demandType', 'origin', 'destination', 'date', 'demandId'],
  },

  // Demand confirmed
  DEMAND_CONFIRMED: {
    subject: 'Votre demande a été confirmée',
    template: 'demand-confirmed',
    variables: ['clientName', 'chauffeurName', 'vehicleType', 'date', 'time', 'missionId'],
  },

  // Mission started
  MISSION_STARTED: {
    subject: 'Votre mission a commencé',
    template: 'mission-started',
    variables: ['clientName', 'chauffeurName', 'vehicleInfo', 'estimatedDuration', 'missionId'],
  },

  // Mission completed
  MISSION_COMPLETED: {
    subject: 'Votre mission est terminée',
    template: 'mission-completed',
    variables: ['clientName', 'totalPrice', 'distance', 'duration', 'missionId', 'invoiceId'],
  },

  // Payment received
  PAYMENT_RECEIVED: {
    subject: 'Paiement reçu - Majestic South Chauffeurs',
    template: 'payment-received',
    variables: ['clientName', 'amount', 'date', 'invoiceId', 'paymentMethod'],
  },

  // Invoice sent
  INVOICE_SENT: {
    subject: 'Votre facture est prête',
    template: 'invoice-sent',
    variables: ['clientName', 'invoiceNumber', 'amount', 'dueDate', 'invoiceId'],
  },

  // Chauffeur assigned
  CHAUFFEUR_ASSIGNED: {
    subject: 'Chauffeur assigné à votre mission',
    template: 'chauffeur-assigned',
    variables: ['clientName', 'chauffeurName', 'chauffeurPhone', 'vehicleInfo', 'eta', 'missionId'],
  },

  // Alert notification
  ALERT_NOTIFICATION: {
    subject: 'Alerte importante - Majestic South Chauffeurs',
    template: 'alert',
    variables: ['alertType', 'alertMessage', 'severity', 'actionRequired'],
  },

  // Review request
  REVIEW_REQUEST: {
    subject: 'Donnez votre avis sur votre mission',
    template: 'review-request',
    variables: ['clientName', 'chauffeurName', 'missionId', 'reviewLink'],
  },

  // Password reset
  PASSWORD_RESET: {
    subject: 'Réinitialiser votre mot de passe',
    template: 'password-reset',
    variables: ['userName', 'resetLink', 'expiryTime'],
  },

  // Welcome email
  WELCOME: {
    subject: 'Bienvenue chez Majestic South Chauffeurs',
    template: 'welcome',
    variables: ['userName', 'accountType', 'onboardingLink'],
  },
};

/**
 * Send email notification
 */
export async function sendEmailNotification(notification: EmailNotification): Promise<boolean> {
  try {
    // In production, integrate with email service (SendGrid, AWS SES, etc.)
    console.log(`[Email] Sending to ${notification.to}`);
    console.log(`[Email] Subject: ${notification.subject}`);
    console.log(`[Email] Template: ${notification.template}`);
    console.log(`[Email] Data:`, notification.data);

    // Simulate email sending
    return true;
  } catch (error) {
    console.error('[Email] Failed to send:', error);
    return false;
  }
}

/**
 * Send new demand notification to admin
 */
export async function notifyNewDemand(
  adminEmail: string,
  demand: {
    id: number;
    type: string;
    origin: string;
    destination: string;
    date: string;
    clientName: string;
  }
): Promise<boolean> {
  return sendEmailNotification({
    to: adminEmail,
    subject: EMAIL_TEMPLATES.NEW_DEMAND.subject,
    template: EMAIL_TEMPLATES.NEW_DEMAND.template,
    data: {
      clientName: demand.clientName,
      demandType: demand.type,
      origin: demand.origin,
      destination: demand.destination,
      date: demand.date,
      demandId: demand.id,
    },
  });
}

/**
 * Send mission completed notification to client
 */
export async function notifyMissionCompleted(
  clientEmail: string,
  mission: {
    id: number;
    clientName: string;
    totalPrice: number;
    distance: number;
    duration: number;
    invoiceId: string;
  }
): Promise<boolean> {
  return sendEmailNotification({
    to: clientEmail,
    subject: EMAIL_TEMPLATES.MISSION_COMPLETED.subject,
    template: EMAIL_TEMPLATES.MISSION_COMPLETED.template,
    data: {
      clientName: mission.clientName,
      totalPrice: mission.totalPrice,
      distance: mission.distance,
      duration: mission.duration,
      missionId: mission.id,
      invoiceId: mission.invoiceId,
    },
  });
}

/**
 * Send payment received notification
 */
export async function notifyPaymentReceived(
  clientEmail: string,
  payment: {
    amount: number;
    date: string;
    invoiceId: string;
    paymentMethod: string;
    clientName: string;
  }
): Promise<boolean> {
  return sendEmailNotification({
    to: clientEmail,
    subject: EMAIL_TEMPLATES.PAYMENT_RECEIVED.subject,
    template: EMAIL_TEMPLATES.PAYMENT_RECEIVED.template,
    data: {
      clientName: payment.clientName,
      amount: payment.amount,
      date: payment.date,
      invoiceId: payment.invoiceId,
      paymentMethod: payment.paymentMethod,
    },
  });
}

/**
 * Send chauffeur assigned notification
 */
export async function notifyChauffeurAssigned(
  clientEmail: string,
  assignment: {
    clientName: string;
    chauffeurName: string;
    chauffeurPhone: string;
    vehicleInfo: string;
    eta: string;
    missionId: number;
  }
): Promise<boolean> {
  return sendEmailNotification({
    to: clientEmail,
    subject: EMAIL_TEMPLATES.CHAUFFEUR_ASSIGNED.subject,
    template: EMAIL_TEMPLATES.CHAUFFEUR_ASSIGNED.template,
    data: assignment,
  });
}

/**
 * Send review request notification
 */
export async function notifyReviewRequest(
  clientEmail: string,
  review: {
    clientName: string;
    chauffeurName: string;
    missionId: number;
    reviewLink: string;
  }
): Promise<boolean> {
  return sendEmailNotification({
    to: clientEmail,
    subject: EMAIL_TEMPLATES.REVIEW_REQUEST.subject,
    template: EMAIL_TEMPLATES.REVIEW_REQUEST.template,
    data: review,
  });
}
