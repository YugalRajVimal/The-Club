import express from 'express';
import {
  createRegistrationForm,
  getRegistrationFormByEmail,
  getAllRegistrationForms,
  updateRegistrationForm,
  deleteRegistrationForm,
} from '../controllers/registratrionController';

const registrationRouter = express.Router();

// Create a new registration form entry
registrationRouter.post('/', createRegistrationForm);

// Get a registration form by email
registrationRouter.get('/:email', getRegistrationFormByEmail);

// Get all registration forms (admin)
registrationRouter.get('/', getAllRegistrationForms);

// Update a registration form by email
registrationRouter.put('/:email', updateRegistrationForm);

// Delete a registration form by email
registrationRouter.delete('/:email', deleteRegistrationForm);

export default registrationRouter;