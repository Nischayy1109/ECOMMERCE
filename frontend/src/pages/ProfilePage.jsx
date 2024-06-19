
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { BsPencilSquare } from "react-icons/bs";
import { patchUser } from "../store/slices/userSlice";
import { useLocation, Link } from "react-router-dom";
import axios from "axios";

function ProfilePage() {
  const fullPath = window.location.href;
  const location = useLocation();
  const initialPath = fullPath.replace(location.pathname, "") + "/";

  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.userDetails);

  const [editingField, setEditingField] = useState(null);
  const [editedValue, setEditedValue] = useState("");
  const [password, setPassword] = useState("");
  const [coverImage, setCoverImage] = useState(null);
  const [error, setError] = useState(null);

  // for changing password
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [message, setMessage] = useState("");

  {
    /*Backend functions*/
  }
  const updateProfileBackend = async () => {
    try {
      const response = await axios.patch(
        `/api/v1/users/update-fullName`,
        {
          [editingField]: editedValue,
        },
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        console.log("Profile updated successfully");
        dispatch(patchUser({ [editingField]: editedValue }));
        return response.data;
      }
    } catch (error) {
      console.log("Error updating profile:", error);
      throw error;
    }
  }; //working

  const updatePhoneBackend = async () => {
    try {
      const response = await axios.post(
        `/api/v1/users/update-phone`,
        {
          newPhone: editedValue,
          //password: password,
        },
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        console.log("Phone updated successfully");
        dispatch(patchUser({ [editingField]: editedValue }));
        return response.data;
      }
    } catch (error) {
      console.log("Error updating phone:", error);
      setError(error.response.data.message);
      throw error;
    }
  }; //working

  const updateCoverImageBackend = async () => {
    const formData = new FormData();
    formData.append('coverImage', coverImage);
    console.log("CoverImage:", coverImage);
    console.log("formData:", formData);

    try {
      const response = await axios.post(
        `/api/v1/users/update-coverImage`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        console.log("CoverImage updated successfully");
        dispatch(patchUser({ coverImage: response.data.data.coverImage }));
        return response.data;
      }
    } catch (error) {
      console.log("Error updating coverimage:", error);
      setError(error.response.data.message);
      throw error;
    }
  };

  const sentOtpBackend = async () => {
    try {
      const response = await axios.post(
        `/api/v1/users/generate-email-otp`,
        {
          email: user.email,
        },
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        console.log("sent successfully");
        return response.data;
      }
    } catch (error) {
      console.log("Error sending OTP:", error);
      setError(error.response.data.message);
      throw error;
    }
  };

  const updatePasswordBackend = async () => {
    try {
      const response = await axios.post(
        `/api/v1/users/change-password`,
        {
          oldPassword,
          newPassword,
        },
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        console.log("Password updated successfully");
        setMessage("Password updated successfully");
        setOldPassword("");
        setNewPassword("");
        return response.data;
      }
    } catch (error) {
      console.log("Error updating password:", error);
      setError(error.response.data.message || "Error updating password");
      throw error;
    }
  };

  //Function to save the edited field
  const handleSave = (field) => {
    if (field === "email") {
      updateEmailBackend();
    } else if (field === "phone") {
      updatePhoneBackend();
    } else {
      updateProfileBackend();
    }

    setEditingField(null);
    setEditedValue("");
  };

  useEffect(() => {
    if (error || message) {
      setTimeout(() => {
        setError(null);
        setMessage(null);
      }, 2500);
    }
  }, [error, message]);

  const handleCoverChange = (e) => {
    const file = e.target.files;
    console.log("File:", file[0]);
    setCoverImage(file[0]);
    updateCoverImageBackend();
  };

  useEffect(() => {
    if (coverImage) {
      updateCoverImageBackend();
    }
  }, [coverImage]);

  const handlePasswordChange = async () => {
    try {
      await updatePasswordBackend();
      setEditingField(null);
    } catch (error) {
      console.error(error);
    }
  };

  {
    /*Buttons*/
  }
  const renderEditButton = (field) => (
    <button
      onClick={() => {
        setEditingField(field);
        if (field !== "password") {
          setEditedValue(user?.[field] || "");
        }
      }}
      className="text-blue-500 hover:text-blue-700 focus:outline-none text-md mr-2 bg-transparent"
    >
      {editingField === field ? "Cancel" : "Edit"}
    </button>
  );

  const renderCancelButton = () => (
    <button
      onClick={() => {
        setEditingField(null);
        setEditedValue("");
      }}
      className="text-red-500 hover:text-red-700 focus:outline-none text-s bg-transparent "
    >
      Cancel
    </button>
  );

  const renderSaveButton = (field) => (
    <>
      <button
        onClick={() => handleSave(field)}
        className="text-blue-500 hover:text-blue-700 focus:outline-none text-s bg-transparent "
      >
        Save
      </button>
      {renderCancelButton()}
    </>
  );

  const renderField = (label, field) => {
    const isSensitiveField = field === "email" || field === "phone";

    return (
      <div className="rounded-lg shadow-md p-6 bg-white m-2">
        <h3 className="text-md font-semibold mb-2 text-slate-500">{label}</h3>
        <div className="flex items-center ">
          {editingField === field ? (
            <div className="w-full">
              <input
                type="text"
                value={editedValue}
                onChange={(e) => setEditedValue(e.target.value)}
                className="rounded-md border bg-purple-200 border-gray-300 py-3 px-4 text-gray-700 w-full"
              />
            </div>
          ) : (
            <div className="rounded-md border bg-purple-200 border-gray-300 py-2 px-4 w-full">
              <div className="text-md text-gray-700 font-semibold">
                {user?.[field]}
              </div>
            </div>
          )}
          <div className="ml-4 p-0">
            {editingField === field
              ? renderSaveButton(field)
              : renderEditButton(field)}
          </div>
        </div>
        {editingField === field && isSensitiveField && (
          <div className="mt-2">
            <label className="block text-sm font-semibold mb-2 text-slate-500">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              className="rounded-md border w-full bg-purple-200 border-gray-300 py-3 px-4 text-gray-700"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        )}
      </div>
    );
  };

  const renderPasswordChangeFields = () => (
    <div className="rounded-lg shadow-md p-6 bg-white m-2 row-span-2">
      <h3 className="text-md font-semibold mb-2 text-slate-500">Change Password</h3>
      <div className="flex flex-col items-start space-y-4">
        <input
          type="password"
          placeholder="Old Password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          className="rounded-md border bg-purple-200 border-gray-300 py-2 px-4 w-full"
          required
        />
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="rounded-md border bg-purple-200 border-gray-300 py-2 px-4 w-full"
          required
        />
        <div className="space-x-4">
          <button
            onClick={handlePasswordChange}
            className="text-blue-500 hover:text-blue-700 focus:outline-none text-s bg-transparent "
          >
            Save
          </button>
          <button
            className="text-red-500 hover:text-red-700 focus:outline-none text-s bg-transparent "
            onClick={() => {
              setEditingField(null);
              setOldPassword("");
              setNewPassword("");
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Account Information</h2>
      <div className="relative flex items-center justify-center mb-8">
        <img src={user?.coverImage} className="w-24 h-24 rounded-full mr-4" alt="User Avatar" />
        <label htmlFor="avatar-upload" className="cursor-pointer">
          <BsPencilSquare className="text-gray-700 hover:text-blue-700" />
        </label>
        <input id="avatar-upload" type="file" className="hidden" onChange={handleCoverChange} />
      </div>
      {renderField("Full Name", "fullName")}
      {renderField("Email", "email")}
      {renderField("Phone", "phone")}
      {editingField === "password" ? renderPasswordChangeFields() : (
        <div className="rounded-lg shadow-md p-6 bg-white m-2">
          <h3 className="text-md font-semibold mb-2 text-slate-500">Password</h3>
          <button
            onClick={() => setEditingField("password")}
            className="text-blue-500 hover:text-blue-700 focus:outline-none text-s bg-transparent "
          >
            Edit
          </button>
        </div>
      )}
      {message && (
        <div className="rounded-lg shadow-md p-6 bg-green-100 m-2 text-green-700">
          {message}
        </div>
      )}
      {error && (
        <div className="rounded-lg shadow-md p-6 bg-red-100 m-2 text-red-700">
          {error}
        </div>
      )}
      <div className="mb-10 bg-gray-200 px-2 pt-2 pb-4 rounded-lg">
        <div className="-m-1 text-black text-2xl font-bold p-4">
          General Information
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 px-2 space-x-7">
          <div className="rounded-lg shadow-md p-6 bg-white m-2">
            <h3 className="text-md font-semibold mb-2 text-slate-500">
              Verified
            </h3>
            <div className="rounded-md border bg-purple-200 border-gray-300 py-2 px-4 w-full">
              <div className="text-md text-gray-700 font-semibold">
                {user?.isVerified ? (
                  "Verified"
                ) : (
                  <>
                    <div>Not verfied</div>
                    <button
                      className="text-xs hover:text-sm active:text-gray-500"
                      //onClick={handleVerify}
                    >
                      Click here to verify your account
                    </button>
                    <div className="text-sm text-blue-500 font-mono flex justify-center p-2">
                      {message}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-lg shadow-md p-6 bg-white m-2">
            <h3 className="text-md font-semibold mb-2 text-slate-500">Role</h3>
            <div className="rounded-md border bg-purple-200 border-gray-300 py-2 px-4 w-full">
              <p className="text-md text-gray-700 font-semibold">
                {user?.isAdmin ? (
                  <Link to="/admin" className="font-bold">
                    Admin
                    <div className="font-mono text-xs font-extralight">
                      Click here to move to admin panel
                    </div>
                  </Link>
                ) : (
                  "User"
                )}
              </p>
            </div>
          </div>
        </div>
    </div>
    </div>
  );
}

export default ProfilePage;
