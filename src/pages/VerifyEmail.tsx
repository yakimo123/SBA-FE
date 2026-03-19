import { Mail, ArrowRight, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";

const VerifyEmailPage = () => {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-[80vh] flex items-center justify-center py-12 px-4 selection:bg-red-100 selection:text-red-600">
      <Card className="max-w-md w-full p-10 text-center shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-none bg-white/80 backdrop-blur-xl animate-in fade-in zoom-in slide-in-from-bottom-5 duration-700 relative overflow-hidden">
        {/* Abstract decorative background element */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative">
          <div className="w-24 h-24 bg-gradient-to-tr from-red-600 to-red-400 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-red-200 rotate-3 transition-transform hover:rotate-0 duration-500">
            <Mail className="w-12 h-12 text-white" />
          </div>
          
          <h1 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">Vui lòng xác thực Email</h1>
          
          <p className="text-gray-600 mb-10 leading-relaxed text-lg font-light">
            Chúc mừng! Tài khoản của bạn đã được khởi tạo. 
            Vui lòng kiểm tra hộp thư đến và nhấn vào liên kết xác nhận để hoàn tất quá trình kích hoạt.
          </p>

          <div className="space-y-4">
            <Button 
              className="w-full bg-red-600 hover:bg-red-700 h-14 text-lg font-semibold shadow-lg shadow-red-200 transition-all hover:shadow-red-300 active:scale-[0.98] flex items-center justify-center gap-3 rounded-xl border-none group"
              onClick={() => window.open("https://gmail.com", "_blank")}
            >
              Mở Gmail ngay <ExternalLink className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Button>

            <div className="pt-2">
              <Button 
                variant="ghost" 
                className="w-full h-12 text-gray-500 hover:text-red-600 hover:bg-red-50/50 font-medium transition-colors rounded-xl"
                asChild
              >
                <Link to="/login" className="flex items-center justify-center gap-2">
                  Quay lại trang đăng nhập <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-500 italic">
              Không nhận được email? <button className="text-red-500 hover:underline font-semibold focus:outline-none not-italic ml-1">Gửi lại link xác nhận</button>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default VerifyEmailPage;
