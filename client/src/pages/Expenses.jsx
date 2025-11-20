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

  // ألوان التصنيفات من الثيم
  const getCategoryColor = (category) => {
    const colors = {
      'Food': 'bg-[var(--color-status-pending-bg)] text-[var(--color-status-pending)]',
      'Transport': 'bg-[var(--color-category-transport-bg)] text-[var(--color-category-transport-text)]',
      'Utilities': 'bg-[var(--color-category-utilities-bg)] text-[var(--color-category-utilities-text)]',
      'Housing': 'bg-[var(--color-category-housing-bg)] text-[var(--color-category-housing-text)]',
      'Entertainment': 'bg-[var(--color-category-entertainment-bg)] text-[var(--color-category-entertainment-text)]',
    };
    return colors[category] || 'bg-[var(--color-category-general-bg)] text-[var(--color-category-general-text)]';
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
          <h1 className="text-2xl font-bold text-[var(--color-dark)]">المصاريف</h1>
          <p className="text-[var(--color-muted)] text-sm mt-1">تتبع فلوسك اللي صرفتها</p>
        </div>
        <div className="p-3 bg-[var(--color-primary)]/10 rounded-full">
          <Receipt className="text-[var(--color-primary)]" size={24} />
        </div>
      </div>

      {/* حالة التحميل */}
      {loading && (
        <div className="text-center py-10 text-[var(--color-muted)]">بنحمّل المصاريف...</div>
      )}

      {/* عرض البطاقات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {!loading && expenses.map(expense => (
          <div 
            key={expense._id} 
            className="group bg-[var(--color-bg)] rounded-2xl p-5 shadow-sm border border-[var(--color-muted-border)] hover:shadow-md transition-all duration-200 relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-3">
              {/* أيقونة التصنيف */}
              <div className={`p-2.5 rounded-xl ${getCategoryColor(expense.category)}`}>
                {getCategoryIcon(expense.category)}
              </div>
              
              {/* المبلغ */}
              <div className="text-right">
                <span className="block text-xl font-bold text-[var(--color-dark)]">
                  {expense.totalAmount.toFixed(2)}
                  <span className="text-xs text-[var(--color-muted)] font-normal mr-1">جنيه</span>
                </span>
              </div>
            </div>

            {/* العنوان */}
            <h3 className="font-semibold text-[var(--color-secondary)] mb-2 line-clamp-1" title={expense.description}>
              {expense.description}
            </h3>
            
            {/* التصنيف */}
            <span className="inline-block px-2.5 py-1 bg-[var(--color-ios-surface)] text-[var(--color-muted)] text-xs font-medium rounded-full mb-4">
              {translateCategory(expense.category)}
            </span>

            {/* المعلومات */}
            <div className="flex items-center justify-between pt-4 border-t border-[var(--color-hover)] mt-auto">
              <div className="flex flex-col gap-1 text-xs text-[var(--color-muted)]">
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
                  className="p-2 text-[var(--color-border)] hover:text-[var(--color-error)] hover:bg-[var(--color-status-rejected-bg)] rounded-lg transition-colors"
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
        <div className="text-center py-20 bg-[var(--color-surface)] rounded-3xl border-2 border-dashed border-[var(--color-border)]">
          <Receipt size={48} className="mx-auto mb-3 text-[var(--color-border)]" />
          <p className="text-[var(--color-muted)] font-medium">مفيش مصاريف متسجلة لسه</p>
          <p className="text-[var(--color-muted)] text-sm mt-1">ابدأ سجّل أول مصروف</p>
        </div>
      )}
    </div>
  );
};

export default Expenses;