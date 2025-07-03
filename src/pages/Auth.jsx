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

      // Wait 1.5 seconds then redirect to home
      setTimeout(() => {
        navigate('/home');
      }, 1500);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={styles.container}>
      <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
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
  );
}

const styles = {
  container: {
    width: '100%',
    maxWidth: '400px',
    margin: '5rem auto',
    padding: '2rem',
    borderRadius: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    textAlign: 'center',
    fontFamily: 'sans-serif'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  input: {
    padding: '10px',
    fontSize: '16px',
    borderRadius: '6px',
    border: '1px solid #ccc'
  },
  button: {
    padding: '10px',
    backgroundColor: '#0077ff',
    color: '#fff',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  toggle: {
    marginTop: '1rem',
    fontSize: '14px'
  },
  link: {
    color: '#0077ff',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  error: {
    color: 'red',
    fontSize: '14px'
  }
};

export default Auth;
