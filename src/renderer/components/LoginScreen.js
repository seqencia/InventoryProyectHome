import React, { useState } from 'react';

export default function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) return;
    setError('');
    setLoading(true);
    try {
      const user = await window.electron.auth.login({ username: username.trim(), password });
      onLogin(user);
    } catch (err) {
      setError(err?.message || 'Error al iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f3f3f3',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRadius: '16px',
        boxShadow: '0 24px 64px rgba(0, 0, 0, 0.13)',
        width: '360px',
        padding: '40px 36px 32px',
      }}>
        {/* Logo / Brand */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '14px',
            background: '#0078d4', display: 'inline-flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: '24px', marginBottom: '14px',
          }}>
            💻
          </div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#0078d4', letterSpacing: '-0.4px' }}>
            StarTecnology
          </div>
          <div style={{ fontSize: '13px', color: '#9e9e9e', marginTop: '4px' }}>
            Sistema de Gestión
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{
              display: 'block', fontSize: '12px', fontWeight: '600',
              color: '#5c5c5c', marginBottom: '5px',
            }}>
              Usuario
            </label>
            <input
              className="fl-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              autoComplete="username"
              style={{
                width: '100%', padding: '9px 12px', border: '1px solid #d1d1d1',
                borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box',
                background: 'white',
              }}
              placeholder="Ingresa tu usuario"
              disabled={loading}
            />
          </div>

          <div style={{ marginBottom: '22px' }}>
            <label style={{
              display: 'block', fontSize: '12px', fontWeight: '600',
              color: '#5c5c5c', marginBottom: '5px',
            }}>
              Contraseña
            </label>
            <input
              className="fl-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              style={{
                width: '100%', padding: '9px 12px', border: '1px solid #d1d1d1',
                borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box',
                background: 'white',
              }}
              placeholder="Ingresa tu contraseña"
              disabled={loading}
            />
          </div>

          {error && (
            <div style={{
              background: '#ffebee', color: '#a4262c', border: '1px solid #ef9a9a',
              borderRadius: '8px', padding: '9px 12px', fontSize: '13px', marginBottom: '16px',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="fl-btn-primary"
            disabled={loading || !username.trim() || !password}
            style={{
              width: '100%', background: '#0078d4', color: 'white',
              border: 'none', padding: '10px', borderRadius: '8px',
              fontSize: '14px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer',
              opacity: (!username.trim() || !password) ? 0.6 : 1,
            }}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}
