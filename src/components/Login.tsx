import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ShieldAlert } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get password from environment variables (built-in Vite support) or fallback to 'admin1234'
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin1234';

    if (password === adminPassword) {
      if (rememberMe) {
        localStorage.setItem('is_admin_authenticated', 'true');
      } else {
        sessionStorage.setItem('is_admin_authenticated', 'true');
      }
      onLoginSuccess();
    } else {
      setError('비밀번호가 올바르지 않습니다.');
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: 'var(--color-bg)',
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '2.5rem 2rem',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
        textAlign: 'center'
      }}>
        {/* Logo / Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'rgba(107, 114, 142, 0.1)',
          color: 'var(--color-slate-blue-light)',
          margin: '0 auto 1.5rem auto'
        }}>
          <Lock size={28} />
        </div>

        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: 600 }}>
          KOITA Compliance System
        </h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
          관리자 인증이 필요합니다.
        </p>

        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.85rem',
              color: 'var(--color-text-muted)',
              marginBottom: '0.5rem',
              fontWeight: 500
            }}>
              비밀번호
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="비밀번호를 입력하세요"
                required
                style={{
                  paddingRight: '2.5rem',
                  fontSize: '0.95rem',
                  height: '42px'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.25rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Remember Me Option */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.5rem',
            cursor: 'pointer',
            userSelect: 'none'
          }} onClick={() => setRememberMe(!rememberMe)}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={() => {}} // Controlled via container click
              style={{
                width: '16px',
                height: '16px',
                cursor: 'pointer'
              }}
            />
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              로그인 상태 유지 (30일)
            </span>
          </div>

          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'var(--color-error-bg)',
              color: 'var(--color-error)',
              padding: '0.75rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              marginBottom: '1.5rem',
              border: '1px solid rgba(255, 107, 107, 0.2)'
            }}>
              <ShieldAlert size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            style={{
              width: '100%',
              justifyContent: 'center',
              height: '42px',
              fontSize: '0.95rem',
              fontWeight: 600,
              backgroundColor: 'var(--color-slate-blue)',
              color: 'white',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            로그인
          </button>
        </form>

        <div style={{
          marginTop: '2rem',
          borderTop: '1px solid var(--color-border)',
          paddingTop: '1rem',
          fontSize: '0.8rem',
          color: 'var(--color-text-muted)'
        }}>
          Vercel 환경 변수 `VITE_ADMIN_PASSWORD`로 비밀번호 설정이 가능합니다.
        </div>
      </div>
    </div>
  );
}
