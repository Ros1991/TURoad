import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { FiMail, FiArrowLeft } from 'react-icons/fi';

const ForgotPasswordPage: React.FC = () => {
  const { forgotPassword } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Por favor, digite seu endereço de email');
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email);
      setSubmitted(true);
      toast.success('Instruções de redefinição enviadas para seu email');
    } catch (error) {
      toast.error('Falha ao enviar instruções de redefinição');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiMail className="text-green-400" size={24} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">Verifique seu Email</h2>
        <p className="text-gray-400 mb-6">
          Enviamos instruções de redefinição de senha para <span className="text-white font-medium">{email}</span>
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Não recebeu o email? Verifique sua pasta de spam ou{' '}
          <button
            onClick={() => {
              setSubmitted(false);
              setEmail('');
            }}
            className="text-blue-400 hover:text-blue-300"
          >
            tente novamente
          </button>
        </p>
        <Link
          to="/login"
          className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors"
        >
          <FiArrowLeft className="mr-2" />
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-2">Esqueceu sua Senha?</h2>
      <p className="text-gray-400 mb-6">
        Digite seu endereço de email e enviaremos instruções para redefinir sua senha.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
            Endereço de Email
          </label>
          <div className="relative">
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 pl-12 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              placeholder="Digite seu email"
            />
            <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-600 focus:ring-4 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02]"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Enviando instruções...
            </span>
          ) : (
            'Enviar Instruções de Redefinição'
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link
          to="/login"
          className="inline-flex items-center text-gray-400 hover:text-white transition-colors"
        >
          <FiArrowLeft className="mr-2" />
          Voltar para login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
