import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { 
  Receipt, Trash2, Calendar, User, 
  Utensils, Car, Zap, Home, Smartphone, CircleDollarSign, Layers 
} from 'lucide-react';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/expenses');
      setExpenses(data);
    } catch (error) {
      console.error('غلط في تحميل المصاريف:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('متأكد انك عايز تمسحها؟')) return;
    try {
      await api.delete(`/expenses/${id}`);
      setExpenses(expenses.filter(e => e._id !== id));
    } catch (error) {
      console.error('غلط في المسح:', error);
    }
  };

  // أيقونات التصنيفات
  const getCategoryIcon = (category) => {
    const icons = {
      'Food': <Utensils size={20} />,
      'Transport': <Car size={20} />,
      'Utilities': <Zap size={20} />,
      'Housing': <Home size={20} />,
      'Entertainment': <Smartphone size={20} />,
      'General': <CircleDollarSign size={20} />,
    };
    return icons[category] || <Layers size={20} />;
  };

  // ألوان التصنيفات
  const getCategoryColor = (category) => {
    const colors = {
      'Food': 'bg-orange-100 text-orange-600',
      'Transport': 'bg-blue-100 text-blue-600',
      'Utilities': 'bg-yellow-100 text-yellow-600',
      'Housing': 'bg-purple-100 text-purple-600',
      'Entertainment': 'bg-pink-100 text-pink-600',
    };
    return colors[category] || 'bg-gray-100 text-gray-600';
  };

  // ترجمة التصنيفات بالعامية المصرية
  const translateCategory = (category) => {
    const translations = {
      'General': 'عام',
      'Food': 'أكل وشرب',
      'Transport': 'مواصلات',
      'Utilities': 'فواتير',
      'Housing': 'سكن',
      'Entertainment': 'ترفيه',
      'Other': 'حاجات تانية'
    };
    return translations[category] || category;
  };

  return (
    <div className="pb-8 px-4 max-w-5xl mx-auto">
      {/* الهيدر */}
      <div className="flex justify-between items-center mb-8 pt-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">المصاريف</h1>
          <p className="text-gray-500 text-sm mt-1">تتبع فلوسك اللي صرفتها</p>
        </div>
        <div className="p-3 bg-blue-50 rounded-full">
          <Receipt className="text-blue-600" size={24} />
        </div>
      </div>

      {/* حالة التحميل */}
      {loading && (
        <div className="text-center py-10 text-gray-400">بنحمّل المصاريف...</div>
      )}

      {/* عرض البطاقات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {!loading && expenses.map(expense => (
          <div 
            key={expense._id} 
            className="group bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-3">
              {/* أيقونة التصنيف */}
              <div className={`p-2.5 rounded-xl ${getCategoryColor(expense.category)}`}>
                {getCategoryIcon(expense.category)}
              </div>
              
              {/* المبلغ */}
              <div className="text-right">
                <span className="block text-xl font-bold text-gray-900">
                  {expense.totalAmount.toFixed(2)}
                  <span className="text-xs text-gray-400 font-normal mr-1">جنيه</span>
                </span>
              </div>
            </div>

            {/* العنوان */}
            <h3 className="font-semibold text-gray-800 mb-2 line-clamp-1" title={expense.description}>
              {expense.description}
            </h3>
            
            {/* التصنيف */}
            <span className="inline-block px-2.5 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-full mb-4">
              {translateCategory(expense.category)}
            </span>

            {/* المعلومات */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
              <div className="flex flex-col gap-1 text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  <Calendar size={12} />
                  <span>
                    {new Date(expense.date).toLocaleDateString('ar-EG', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric',
                      calendar: 'gregory' // ميلادي
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <User size={12} />
                  <span>{expense.createdBy.name}</span>
                </div>
              </div>

              {/* زر المسح (للأدمن بس) */}
              {user.role === 'admin' && (
                <button 
                  onClick={() => handleDelete(expense._id)}
                  className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="امسح"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* لو مفيش مصاريف */}
      {!loading && expenses.length === 0 && (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <Receipt size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500 font-medium">مفيش مصاريف متسجلة لسه</p>
          <p className="text-gray-400 text-sm mt-1">ابدأ سجّل أول مصروف</p>
        </div>
      )}
    </div>
  );
};

export default Expenses;