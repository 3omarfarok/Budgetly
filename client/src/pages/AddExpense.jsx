import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { PlusCircle, Check } from 'lucide-react';

// صفحة إضافة مصروف - تصميم iOS
const AddExpense = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    description: '',
    category: 'General',
    totalAmount: '',
    splitType: 'equal'
  });
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/');
    }
    fetchUsers();
  }, [user, navigate]);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch (error) {
      console.error('خطأ في تحميل المستخدمين:', error);
    }
  };

  const handleSplitTypeChange = (e) => {
    const newSplitType = e.target.value;
    setFormData({...formData, splitType: newSplitType});
    if (newSplitType === 'equal') {
      setSelectedUsers([]);
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.splitType === 'specific' && selectedUsers.length === 0) {
      setError('يرجى اختيار مستخدم واحد على الأقل');
      return;
    }

    try {
      const expenseData = {
        ...formData,
        totalAmount: Number(formData.totalAmount)
      };
      
      if (formData.splitType === 'specific') {
        expenseData.selectedUsers = selectedUsers;
      }

      await api.post('/expenses', expenseData);
      navigate('/expenses');
    } catch (err) {
      setError(err.response?.data?.message || 'خطأ في إنشاء المصروف');
    }
  };

  if (user?.role !== 'admin') return null;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-ios-primary/10 rounded-2xl">
          <PlusCircle className="text-ios-primary" size={32} />
        </div>
        <h1 className="text-3xl font-bold text-ios-dark">سجّل مصروف جديد</h1>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-ios-light/50 space-y-6 shadow-lg">
        <div>
          <label className="block text-sm font-semibold text-ios-dark mb-2">وصف المصروف</label>
          <input
            type="text"
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            className="w-full px-5 py-3.5 bg-ios-bg/50 border border-ios-light rounded-2xl text-ios-dark focus:outline-none focus:border-ios-primary focus:ring-2 focus:ring-ios-primary/20 transition-all"
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-ios-dark mb-2">النوع</label>
            <select
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value})}
              className="w-full px-5 py-3.5 bg-ios-bg/50 border border-ios-light rounded-2xl text-ios-dark focus:outline-none focus:border-ios-primary focus:ring-2 focus:ring-ios-primary/20 transition-all"
            >
              <option value="General">عام</option>
              <option value="Food">أكل وشرب</option>
              <option value="Transport">مواصلات</option>
              <option value="Utilities">فواتير</option>
              <option value="Entertainment">ترفيه</option>
              <option value="Housing">سكن</option>
              <option value="Other">حاجات تانية</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-ios-dark mb-2">الفلوس (جنيه)</label>
            <input
              type="number"
              step="0.01"
              value={formData.totalAmount}
              onChange={e => setFormData({...formData, totalAmount: e.target.value})}
              className="w-full px-5 py-3.5 bg-ios-bg/50 border border-ios-light rounded-2xl text-ios-dark focus:outline-none focus:border-ios-primary focus:ring-2 focus:ring-ios-primary/20 transition-all"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-ios-dark mb-2">هنقسمها إزاي</label>
          <select
            value={formData.splitType}
            onChange={handleSplitTypeChange}
            className="w-full px-5 py-3.5 bg-ios-bg/50 border border-ios-light rounded-2xl text-ios-dark focus:outline-none focus:border-ios-primary focus:ring-2 focus:ring-ios-primary/20 transition-all"
          >
            <option value="equal">قسّمها على الكل</option>
            <option value="specific">قسّمها على ناس معينة</option>
          </select>
        </div>

        {formData.splitType === 'specific' && (
          <div className="bg-ios-bg/50 p-5 rounded-2xl border border-ios-light">
            <label className="block text-sm font-semibold text-ios-dark mb-3">اختار مين هيدفع</label>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {users.map(u => (
                <div
                  key={u._id}
                  onClick={() => toggleUserSelection(u._id)}
                  className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all ${
                    selectedUsers.includes(u._id)
                      ? 'bg-ios-primary/20 border border-ios-primary/50'
                      : 'bg-white border border-ios-light hover:bg-ios-light/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedUsers.includes(u._id)
                        ? 'bg-ios-primary border-ios-primary'
                        : 'border-ios-secondary'
                    }`}>
                      {selectedUsers.includes(u._id) && (
                        <Check size={16} className="text-white" />
                      )}
                    </div>
                    <span className="text-ios-dark font-semibold">{u.name}</span>
                  </div>
                  <span className="text-ios-secondary text-sm">@{u.username}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-ios-secondary mt-3">
              اخترت: {selectedUsers.length} من {users.length} شخص
            </p>
          </div>
        )}

        <button 
          type="submit" 
          className="w-full py-4 px-4 bg-ios-primary hover:bg-ios-dark text-white font-bold rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl mt-4"
        >
          سجّل المصروف
        </button>
      </form>
    </div>
  );
};

export default AddExpense;
