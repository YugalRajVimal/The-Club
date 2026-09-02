import { Request, Response } from 'express';
import RegistrationForm from '../models/Form';

// Controller to create a new registration form entry
export const createRegistrationForm = async (req: Request, res: Response) => {
  try {
    // Copy all fields from the request body (ensure your route applies validation)
    const formData = req.body;
    console.log('Received registration data:', formData);

    // Save the registration form
    const registrationForm = await RegistrationForm.create(formData);
    console.log('Saved registration form:', registrationForm);

    // Remove sensitive fields from response
    if (registrationForm && registrationForm.toObject) {
      const formObj = registrationForm.toObject();
      delete formObj.password;
      return res.status(201).json({
        message: 'Registration form submitted successfully',
        form: formObj,
      });
    } else {
      return res.status(201).json({
        message: 'Registration form submitted successfully',
        form: registrationForm,
      });
    }
  } catch (error: any) {
    console.log('Error in createRegistrationForm:', error);
    if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
      // Duplicate email entry
      return res.status(409).json({ message: 'Email already registered' });
    }
    return res.status(500).json({ message: 'Failed to submit registration form', error: error.message });
  }
};

// Controller to get a registration form by email
export const getRegistrationFormByEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    const registrationForm = await RegistrationForm.findOne({ email: email.toLowerCase() }).select('-password');
    if (!registrationForm) {
      return res.status(404).json({ message: 'Registration form not found' });
    }
    return res.status(200).json(registrationForm);
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to get registration form', error: error.message });
  }
};

// Controller to get all registration forms (admin use)
export const getAllRegistrationForms = async (req: Request, res: Response) => {
  try {
    const forms = await RegistrationForm.find().select('-password');
    return res.status(200).json(forms);
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to get registration forms', error: error.message });
  }
};

// Controller to update a registration form by email
export const updateRegistrationForm = async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    const updates = req.body;
    if (updates.password) {
      delete updates.password; // Do not update password via this route
    }
    const updatedForm = await RegistrationForm.findOneAndUpdate(
      { email: email.toLowerCase() },
      updates,
      { new: true }
    ).select('-password');
    if (!updatedForm) {
      return res.status(404).json({ message: 'Registration form not found' });
    }
    return res.status(200).json({
      message: 'Registration form updated successfully',
      form: updatedForm,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to update registration form', error: error.message });
  }
};

// Controller to delete a registration form by email
export const deleteRegistrationForm = async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    const deletedForm = await RegistrationForm.findOneAndDelete({ email: email.toLowerCase() });
    if (!deletedForm) {
      return res.status(404).json({ message: 'Registration form not found' });
    }
    return res.status(200).json({ message: 'Registration form deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to delete registration form', error: error.message });
  }
};