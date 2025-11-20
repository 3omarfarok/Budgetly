import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Banknote, Calendar, User, CheckCircle, XCircle, Clock, PlusCircle } from 'lucide-react';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const endpoint = user.role === 'admin' ? '/payments' : `/payments/user/${user.id}`;
      const { data } = await api.get(endpoint);
      setPayments(data);
    } catch (error) {
      console.error('غلط في تحميل المدفوعات:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.patch(`/payments/${id}/approve`);
      fetchPayments();
    } catch (error) {
      console.error('غلط في الموافقة:', error);
    }
  };

  const handleReject = async (id) => {
    try {
      await api.patch(`/payments/${id}/reject`);
      fetchPayments();
    } catch (error) {
      console.error('غلط في الرفض:', error);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'pending': { color: 'bg-yellow-100 text-yellow-600', icon: Clock, text: 'مستني' },
      'approved': { color: 'bg-green-100 text-green-600', icon: CheckCircle, text: 'موافق عليه' },
      'rejected': { color: 'bg-red-100 text-red-600', icon: XCircle, text: 'مرفوض' }
    };
    return badges[status] || badges.pending;
  };

  return (
    <div className="pb-8 px-4 max-w-5xl mx-auto">
      {/* الهيدر */}
      <div className="flex justify-between items-center mb-8 pt-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">المدفوعات</h1>
          <p className="text-gray-500 text-sm mt-1">تتبع الفلوس اللي اتدفعت</p>
        </div>
        <div className="flex items-center gap-3">
          {user.role === 'admin' && (
            <button 
              onClick={() => navigate('/add-payment')}
              className="px-4 py-2.5 bg-ios-primary hover:bg-ios-dark text-white font-semibold rounded-2xl transition-all shadow-lg flex items-center gap-2"
            >
              <PlusCircle size={18} />
              <span className="hidden sm:inline">سجّل دفعة</span>
            </button>
          )}
          <div className="p-3 bg-green-50 rounded-full">
            <Banknote className="text-green-600" size={24} />
          </div>
        </div>
      </div>

      {/* حالة التحميل */}
      {loading && (
        <div className="text-center py-10 text-gray-400">بنحمّل المدفوعات...</div>
      )}

      {/* عرض البطاقات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {!loading && payments.map(payment => {
          const statusBadge = getStatusBadge(payment.status);
          const StatusIcon = statusBadge.icon;
          
          return (
            <div 
              key={payment._id} 
              className="group bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200"
            >
              <div className="flex justify-between items-start mb-3">
                {/* بادج الحالة */}
                <div className={`px-3 py-1.5 rounded-xl ${statusBadge.color} flex items-center gap-1.5`}>
                  <StatusIcon size={14} />
                  <span className="text-xs font-semibold">{statusBadge.text}</span>
                </div>
                
                {/* المبلغ */}
                <div className="text-right">
                  <span className="block text-xl font-bold text-gray-900">
                    {payment.amount?.toFixed(2) || '0.00'}
                    <span className="text-xs text-gray-400 font-normal mr-1">جنيه</span>
                  </span>
                </div>
              </div>

              {/* اسم الدافع */}
              <h3 className="font-semibold text-gray-800 mb-4">
                {payment.user?.name || payment.paidBy?.name || 'مستخدم'}
              </h3>

              {/* المعلومات */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <div className="flex flex-col gap-1 text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={12} />
                    <span>
                      {new Date(payment.date || payment.createdAt).toLocaleDateString('ar-EG', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric',
                        calendar: 'gregory'
                      })}
                    </span>
                  </div>
                  {payment.recordedBy && (
                    <div className="flex items-center gap-1.5">
                      <User size={12} />
                      <span>سجله: {payment.recordedBy?.name || 'أدمن'}</span>
                    </div>
                  )}
                </div>

                {/* أزرار الموافقة/الرفض (للأدمن بس) */}
                {user.role === 'admin' && payment.status === 'pending' && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleApprove(payment._id)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="وافق"
                    >
                      <CheckCircle size={18} />
                    </button>
                    <button 
                      onClick={() => handleReject(payment._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="ارفض"
                    >
                      <XCircle size={18} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* لو مفيش مدفوعات */}
      {!loading && payments.length === 0 && (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <Banknote size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500 font-medium">مفيش مدفوعات متسجلة لسه</p>
        </div>
      )}
    </div>
  );
};

export default Payments;
