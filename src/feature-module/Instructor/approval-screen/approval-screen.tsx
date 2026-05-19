import { Button } from "antd";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../../core/redux/authSlice";

const TeacherApprovalScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login"); // Change to your login route
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 6px 24px rgba(0,0,0,0.07)",
          padding: "48px 40px",
          textAlign: "center",
          maxWidth: 420,
          marginTop: 80,
        }}
      >
        <h4 style={{ fontWeight: 700, color: "#212333", marginBottom: 16 }}>
          Account Pending Approval
        </h4>
        <p className="text-gray-500 text-base mb-6">
          Thank you for registering in Bluverse Digital Hub.
          <br />
          Your account is currently under review. Once it is approved, you’ll be
          able to access your account.
        </p>
        <Button
          type="primary"
          size="large"
          className="bg-secondary"
          icon={<i className="isax isax-logout-1" />}
          onClick={handleLogout}
          style={{ width: "100%", borderRadius: 8 }}
        >
          Logout
        </Button>
      </div>
    </div>
  );
};

export default TeacherApprovalScreen;
