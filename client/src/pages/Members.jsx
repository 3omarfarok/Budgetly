import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Users, UserPlus, ShieldCheck, User as UserIcon } from 'lucide-react';

// صفحة الأعضاء - تصميم iOS
const Members = () => {
  const [members, setMembers] = useState([]);
  const { user } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '', name: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const { data } = await api.get('/users');
      setMembers(data);
    } catch (error) {
      console.error('خطأ في تحميل الأعضاء:', error);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/users', formData);
      setMembers([...members, data]);
      setShowAddForm(false);
      setFormData({ username: '', password: '', name: '' });
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'خطأ في إضافة العضو');
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('هل أنت متأكد من تعطيل هذا المستخدم؟')) return;
    try {
      await api.delete(`/users/${id}`);
      fetchMembers();
    } catch (error) {
      console.error('خطأ في تعطيل المستخدم:', error);
    }
  };

  return (
    <div className="pb-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-ios-primary/10 rounded-2xl">
            <Users className="text-ios-primary" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-ios-dark">الناس</h1>
        </div>
        {user.role === 'admin' && (
          <button 
            onClick={() => setShowAddForm(!showAddForm)} 
            className="px-5 py-3 bg-ios-primary hover:bg-ios-dark text-white font-semibold rounded-2xl transition-all shadow-lg flex items-center gap-2"
          >
            <UserPlus size={20} />
            {showAddForm ? 'إلغاء' : 'ضيف حد'}
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-ios-light/50 mb-8 max-w-lg mx-auto shadow-lg">
          <h3 className="text-xl font-bold mb-4 text-ios-dark">ضيف واحد جديد</h3>
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-2xl mb-4 text-sm border border-red-200">{error}</div>}
          <form onSubmit={handleAddMember} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-ios-dark mb-1">الاسم</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 bg-ios-bg/50 border border-ios-light rounded-2xl text-ios-dark focus:outline-none focus:border-ios-primary focus:ring-2 focus:ring-ios-primary/20 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ios-dark mb-1">اسم المستخدم</label>
              <input
                type="text"
                value={formData.username}
                onChange={e => setFormData({...formData, username: e.target.value})}
                className="w-full px-4 py-3 bg-ios-bg/50 border border-ios-light rounded-2xl text-ios-dark focus:outline-none focus:border-ios-primary focus:ring-2 focus:ring-ios-primary/20 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ios-dark mb-1">كلمة المرور</label>
              <input
                type="password"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-3 bg-ios-bg/50 border border-ios-light rounded-2xl text-ios-dark focus:outline-none focus:border-ios-primary focus:ring-2 focus:ring-ios-primary/20 transition-all"
                required
              />
            </div>
            <button 
              type="submit" 
              className="w-full py-3 px-4 bg-ios-primary hover:bg-ios-dark text-white font-bold rounded-2xl transition-all shadow-lg"
            >
              ضيفه
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map(member => (
          <div key={member._id} className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-ios-light/50 flex flex-col items-center text-center hover:shadow-lg transition-all">
            <div className="w-20 h-20 bg-gradient-to-br from-ios-primary to-ios-secondary rounded-full flex items-center justify-center text-3xl font-bold text-white mb-4 shadow-lg">
              {member.name.charAt(0).toUpperCase()}
            </div>
            <h3 className="text-lg font-bold text-ios-dark mb-1">{member.name}</h3>
            <p className="text-ios-secondary text-sm mb-4">@{member.username}</p>
            
            <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide mb-4 flex items-center gap-1.5 ${
              member.role === 'admin' 
                ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' 
                : 'bg-ios-primary/10 text-ios-primary border border-ios-primary/20'
            }`}>
              {member.role === 'admin' ? <ShieldCheck size={14} /> : <UserIcon size={14} />}
              {member.role === 'admin' ? 'أدمن' : 'عضو'}
            </span>

            {user.role === 'admin' && member.role !== 'admin' && (
              <button 
                onClick={() => handleDeactivate(member._id)} 
                className="mt-auto px-4 py-2 border-2 border-red-200 text-red-600 hover:bg-red-50 rounded-2xl text-sm font-semibold transition-all w-full"
              >
                امسحه
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Members;
