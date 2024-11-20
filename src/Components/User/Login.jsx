import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../public/userForm.css';
import { auth, usersCollection, adminsCollection } from '../../../Utils/firebaseconfig';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { getDoc, getDocs, query, where, doc } from 'firebase/firestore';

function Login() {
  const [user, setUser] = useState({ email: '', password: '' });
  const [inputValidityEmail, setInputValidityEmail] = useState(null);
  const [inputValidityPassword, setInputValidityPassword] = useState(null);
  const [shake, setShake] = useState(false);
  const [error, setError] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false); // New state to toggle reset password input
  const [resetEmail, setResetEmail] = useState(''); // State for storing email to reset password
  const navigate = useNavigate();

  function handelChange(event) {
    const { name, value } = event.target;

    if (name === 'email') {
      value === '' ? setInputValidityEmail(null) : setInputValidityEmail(true);
      setUser(prev => {
        return {
          ...prev,
          [name]: value.toLowerCase()
        };
      });
    } else {
      value === '' ? setInputValidityPassword(null) : setInputValidityPassword(true);
      setUser(prev => {
        return {
          ...prev,
          [name]: value
        };
      });
    }
  }

  async function handelSubmit(event) {
    event.preventDefault();
    const { email, password } = user;
    let hasError = false;

    if (inputValidityEmail === null || inputValidityEmail === false) {
      setInputValidityEmail(false);
      hasError = true;
    }

    if (inputValidityPassword === null || inputValidityPassword === false) {
      setInputValidityPassword(false);
      hasError = true;
    }

    if (hasError) {
      setTimeout(() => {
        // Clear shake effect by removing the class after the shake animation
        const inputs = document.querySelectorAll('.user-form-input');
        inputs.forEach(input => {
          if (input.classList.contains('is-invalid')) {
            input.classList.add('shake');
          }
        });
        setTimeout(() => {
          inputs.forEach(input => {
            input.classList.remove('shake');
          });
        }, 500); // Duration of the shake effect
      }, 0);
      return; // Stop the submission process
    }

    const q = query(usersCollection, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    try {
        const q = query(usersCollection, where('email', '==', email));
        const querySnapshot = await getDocs(q);
    
        const res = await signInWithEmailAndPassword(auth, email, password);
        const uid = res.user.uid; // Get the user's UID
    
        // Check if the user is an admin
        const adminDocRef = doc(adminsCollection, uid);
        const adminDocSnap = await getDoc(adminDocRef);
    
        if (adminDocSnap.exists()) {
          navigate('/admin'); // Admin user
        } else if (!querySnapshot.empty) {
          navigate('/emp'); // Regular employee
        } else {
          setError('User not found'); // Handle this scenario
        }
      } catch (err) {
        let errorMessage;
        switch (err.code) {
          case 'auth/invalid-credential':
            errorMessage = 'כתובת הדוא״ל או הסיסמא שגויים';
            break;
          default:
            errorMessage = 'שגיאה לא צפויה. אנא נסה שוב מאוחר יותר.';
            break;
        }
        setError(errorMessage);
      }
    }

  // Function to handle password reset
  const handleResetPassword = async () => {
    if (resetEmail === '') {
      setError('נא להזין כתובת דוא״ל');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setError('הקישור לאיפוס סיסמא נשלח. אנא בדוק את הדוא״ל שלך.');
      setShowResetPassword(false); // Hide reset email input after successful request
    } catch (error) {
      setError('שגיאה בשליחת הקישור. אנא נסה שוב.');
    }
  };

  return (
    <div className='py-5 my-5 text-center user-login-container'>
      <form onSubmit={handelSubmit} className='p-5 p-md-5 border rounded-3 bg-body-tertiary user-login-container'>
        <h2 className='mb-4'>סידור עבודה מוקד תפעולי</h2>

        <div className='my-3'>
          <input
            value={user.email}
            type='text'
            onChange={handelChange}
            className={`form-control user-form-input ${
              inputValidityEmail === true ? '' : inputValidityEmail === false ? 'is-invalid' : ''
            } ${shake && inputValidityEmail === false ? 'shake' : ''}`}
            name='email'
            placeholder='אימייל'
          />
        </div>
        <div className='my-3'>
          <input
            value={user.password}
            type='password'
            onChange={handelChange}
            className={`form-control user-form-input ${
              inputValidityPassword === true ? '' : inputValidityPassword === false ? 'is-invalid' : ''
            } ${shake && inputValidityPassword === false ? 'shake' : ''}`}
            name='password'
            placeholder='סיסמא'
          />
        </div>
        <p className='error-login'>{error}</p>

        <button className='w-100 btn btn-lg btn-primary' type='submit'>
          התחבר
        </button>

        <hr className='my-4' />
        <div className='mx-5 px-5'>
          <p className='text-body-secondary ms-1 login-p'>
            משתמש חדש ?
          </p>
          <p><a href='/signUp'>לחץ כאן כדי להירשם</a></p>
        </div>
        {/* Reset Password Link */}
        <div>
          <button
            type='button'
            className='btn btn-link'
            onClick={() => setShowResetPassword(!showResetPassword)}
          >
            שכחת סיסמא?
          </button>

          {/* Reset Password Input */}
          {showResetPassword && (
            <div className='my-3'>
              <input
                value={resetEmail}
                type='email'
                onChange={(e) => setResetEmail(e.target.value)}
                className='form-control user-form-input'
                placeholder='הזן אימייל לאיפוס סיסמא'
              />
              <button
                type='button'
                className='btn btn-primary mt-3'
                onClick={handleResetPassword}
              >
                שלח קישור לאיפוס
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

export default Login;
