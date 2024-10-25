export function createFormTemplate() {
  return `'use client';

import { useState } from 'react';

export default function ContactForm() {
 const [submitted, setSubmitted] = useState(false);
 const [formData, setFormData] = useState({
   firstName: '',
   lastName: '',
   email: '', 
   phone: '',
   message: ''
 });

 const handleChange = (
   e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
 ) => {
   setFormData({ ...formData, [e.target.name]: e.target.value });
 };

 const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
   e.preventDefault();
   try {
     const response = await fetch('/api/send', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
       },
       body: JSON.stringify(formData),
     });

     if (!response.ok) {
       throw new Error('Failed to send message');
     }

     setSubmitted(true);
     setFormData({
       firstName: '',
       lastName: '',
       email: '',
       phone: '',
       message: '',
     });

     setTimeout(() => setSubmitted(false), 3000);
   } catch (error) {
     console.error('Error:', error);
   }
 };

 return (
   <div className="max-w-xl mx-auto p-6">
     <form onSubmit={handleSubmit} className="space-y-6">
       <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
         <div>
           <label htmlFor="firstName" className="block text-sm font-medium">
             First name
           </label>
           <input
             type="text"
             id="firstName"
             name="firstName"
             value={formData.firstName}
             onChange={handleChange}
             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
             required
           />
         </div>
         <div>
           <label htmlFor="lastName" className="block text-sm font-medium">
             Last name
           </label>
           <input
             type="text"
             id="lastName"
             name="lastName"
             value={formData.lastName}
             onChange={handleChange}
             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
             required
           />
         </div>
       </div>

       <div>
         <label htmlFor="email" className="block text-sm font-medium">
           Email
         </label>
         <input
           type="email"
           id="email"
           name="email"
           value={formData.email}
           onChange={handleChange}
           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
           required
         />
       </div>

       <div>
         <label htmlFor="phone" className="block text-sm font-medium">
           Phone
         </label>
         <input
           type="tel"
           id="phone"
           name="phone"
           value={formData.phone}
           onChange={handleChange}
           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
           required
         />
       </div>

       <div>
         <label htmlFor="message" className="block text-sm font-medium">
           Message
         </label>
         <textarea
           id="message"
           name="message"
           rows={4}
           value={formData.message}
           onChange={handleChange}
           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
           required
         />
       </div>

       <button
         type="submit"
         className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
       >
         Send message
       </button>

       {submitted && (
         <div className="rounded-md bg-green-50 p-4">
           <div className="flex">
             <div className="flex-shrink-0">
               <svg
                 className="h-5 w-5 text-green-400"
                 viewBox="0 0 20 20"
                 fill="currentColor"
               >
                 <path
                   fillRule="evenodd"
                   d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                   clipRule="evenodd"
                 />
               </svg>
             </div>
             <div className="ml-3">
               <p className="text-sm font-medium text-green-800">
                 Message sent successfully!
               </p>
             </div>
           </div>
         </div>
       )}
     </form>
   </div>
 );
}`
}
