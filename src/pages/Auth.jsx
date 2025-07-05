import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useNavigate } from 'react-router-dom';

function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate(); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        setSuccess('Welcome back!');
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        setSuccess('Account created successfully!');
      }

      setTimeout(() => {
        navigate('/home');
      }, 1500);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        <h2 style={styles.heading}>{isLogin ? 'Login to GlobeTrekker' : 'Create Your GlobeTrekker Account'}</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />
          {error && <p style={styles.error}>{error}</p>}
          <button type="submit" style={styles.button}>
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>
        <p style={styles.toggle}>
          {isLogin ? 'Don’t have an account?' : 'Already have an account?'}{' '}
          <span onClick={() => setIsLogin(!isLogin)} style={styles.link}>
            {isLogin ? 'Sign up' : 'Login'}
          </span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Segoe UI, sans-serif',
    backgroundColor: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(5px)",
  },

  container: {
    width: '100%',
    maxWidth: '420px',
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '2rem',
    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
    textAlign: 'center',
  },
  heading: {
    fontSize: '20px',
    fontWeight: '700',
    marginBottom: '1.5rem',
    color: '#d0006f'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  input: {
    padding: '12px 14px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '15px',
    outline: 'none',
  },
  button: {
    marginTop: "1rem",
    padding: "0.85rem",
    backgroundColor: "#d0006f",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "700",
    fontSize: "15px",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  toggle: {
    marginTop: '1.25rem',
    fontSize: '14px'
  },
  link: {
    color: '#d0006f',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  error: {
    color: 'red',
    fontSize: '14px'
  }
};

export default Auth;



// import React, { useState } from 'react';
// import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
// import { auth } from '../services/firebase';
// import { useNavigate } from 'react-router-dom';

// function Auth() {
//   const [isLogin, setIsLogin] = useState(true);
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const navigate = useNavigate(); 

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setSuccess('');
//     try {
//       if (isLogin) {
//         await signInWithEmailAndPassword(auth, email, password);
//         setSuccess('Welcome back!');
//       } else {
//         await createUserWithEmailAndPassword(auth, email, password);
//         setSuccess('Account created successfully!');
//       }

//       setTimeout(() => {
//         navigate('/home');
//       }, 1500);
//     } catch (err) {
//       setError(err.message);
//     }
//   };

//   return (
//     <div style={styles.container}>
//       <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
//       <form onSubmit={handleSubmit} style={styles.form}>
//         <input
//           type="email"
//           placeholder="Email"
//           value={email}
//           required
//           onChange={(e) => setEmail(e.target.value)}
//           style={styles.input}
//         />
//         <input
//           type="password"
//           placeholder="Password"
//           value={password}
//           required
//           onChange={(e) => setPassword(e.target.value)}
//           style={styles.input}
//         />
//         {error && <p style={styles.error}>{error}</p>}
//         <button type="submit" style={styles.button}>
//           {isLogin ? 'Login' : 'Sign Up'}
//         </button>
//       </form>
//       <p style={styles.toggle}>
//         {isLogin ? 'Don’t have an account?' : 'Already have an account?'}{' '}
//         <span onClick={() => setIsLogin(!isLogin)} style={styles.link}>
//           {isLogin ? 'Sign up' : 'Login'}
//         </span>
//       </p>
//     </div>
//   );
// }

// const styles = {
//   container: {
//     width: '100%',
//     maxWidth: '400px',
//     margin: '5rem auto',
//     padding: '2rem',
//     borderRadius: '12px',
//     backgroundColor: 'rgba(255, 255, 255, 0.5)',
//     backdropFilter: 'blur(10px)',
//     boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
//     textAlign: 'center',
//     fontFamily: 'sans-serif'
//   },
//   form: {
//     display: 'flex',
//     flexDirection: 'column',
//     gap: '1rem'
//   },
//   input: {
//     padding: '10px',
//     fontSize: '16px',
//     borderRadius: '6px',
//     border: '1px solid #ccc'
//   },
// button: {
//     marginTop: "1rem",
//     padding: "0.85rem",
//     backgroundColor: "#d0006f",
//     color: "#fff",
//     border: "none",
//     borderRadius: "8px",
//     fontWeight: "700",
//     fontSize: "15px",
//     cursor: "pointer",
//     transition: "background-color 0.3s ease",
//   },
//   toggle: {
//     marginTop: '1rem',
//     fontSize: '14px'
//   },
//   link: {
//     color: '#0077ff',
//     cursor: 'pointer',
//     fontWeight: 'bold'
//   },
//   error: {
//     color: 'red',
//     fontSize: '14px'
//   }
// };

// export default Auth;
