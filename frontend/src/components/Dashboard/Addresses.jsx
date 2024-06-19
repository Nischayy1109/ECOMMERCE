import React, { useEffect, useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import axios from "axios";

import Modal from '../OrderConfirmation/Modal';

function Addresses() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [addressToRemove, setAddressToRemove] = useState(null);
  const [error, setError] = useState(null);

  const handleCloseModal = () => {
    setShowModal(false);
    setAddressToRemove(null);
  };

  // Fetch addresses from the backend
  const fetchAddresses = async () => {
    try {
      const response = await axios.get("/api/v1/addresses", {
        withCredentials: true,
      });
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch addresses", error);
    }
  };

  const {
    data: addressData,
    isLoading: addressLoading,
    isError: isAddressError,
    error: addressErrors,
  } = useQuery({
    queryKey: ["addresses"],
    queryFn: fetchAddresses,
    retry: 1,
  });

  console.log(addressData);

  // if (addressLoading) return <div>Loading...</div>;
  // if (isAddressError) return <div>Error: {addressErrors.message}</div>;

  // Update address in the backend
  const [editMode, setEditMode] = useState(null);
  const [editedValues, setEditedValues] = useState({});

  const updateBackendAddress = async (addressId, editedValues) => {
    const body = {
      addressLine1: editedValues.addressLine1,
      addressLine2: editedValues.addressLine2,
      city: editedValues.city,
      state: editedValues.state,
      zipcode: editedValues.zipcode,
      country: editedValues.country,
      phoneNumber: editedValues.phoneNumber,
    };

    const response = await axios.patch(
      `/api/v1/addresses/update/${addressId}`,
      body,
      { withCredentials: true }
    );
    return response.data.data;
  };

  const { mutate: updateAddress } = useMutation({
    mutationFn: ({ addressId, editedValues }) =>
      updateBackendAddress(addressId, editedValues),
    onSuccess: () => {
      queryClient.invalidateQueries(["addresses"]);
    },
  });

  const handleUpdate = (addressId) => {
    setEditMode(addressId);
    const addressToUpdate = addressData.find(
      (address) => address._id === addressId
    );
    setEditedValues(addressToUpdate);
  };

  const handleSave = () => {
    updateAddress(
      { addressId: editMode, editedValues },
      {
        onSuccess: () => {
          setEditMode(null);
          setEditedValues({});
        },
      }
    );
  };

  // Remove address from the backend
  const removeBackendAddress = async (addressId) => {
    try {
      const response = await axios.delete(
        `/api/v1/addresses/remove/${addressId}`,
        { withCredentials: true }
      );
      return response.data.data;
    } catch (error) {
      console.error("Failed to remove address", error);
    }
  };

  const { mutate: deleteAddress } = useMutation({
    mutationFn: removeBackendAddress,
    onSuccess: () => {
      queryClient.invalidateQueries(["addresses"]);
    },
  });

  const handleRemove = (addressId) => {
    setAddressToRemove(addressId);
    setShowModal(true);
  };

  const handleConfirmDeletion = () => {
    deleteAddress(addressToRemove);
    setShowModal(false);
    setAddressToRemove(null);
  };

  // Add address to the backend
  const [addingNewAddress, setAddingNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phoneNumber: "",
  });

  const addingNewAddressBackend = async () => {
    try {
      const response = await axios.post(
        "/api/v1/addresses/add",
        newAddress,
        { withCredentials: true }
      );

      if (response.status === 201) {
        console.log("Address added", response.data.data);
        return response.data.data;
      }
    } catch (error) {
      console.error("Failed to add address", error);
      throw error;
    }
  };

  const { mutate: addAddress } = useMutation({
    mutationFn: addingNewAddressBackend,
    onSuccess: () => {
      queryClient.invalidateQueries(["addresses"]);
      setAddingNewAddress(false);
      setNewAddress({
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        zipcode: "",
        country: "",
        phoneNumber: "",
      });
    },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAddress({ ...newAddress, [name]: value });
  };

  const handleAdd = () => {
    console.log("Add new address", newAddress);
    if (
      !newAddress.addressLine1 ||
      !newAddress.city ||
      !newAddress.zipcode ||
      !newAddress.country ||
      !newAddress.phoneNumber
    ) {
      setError("Please fill all the required fields");
      return;
    }

    addAddress(newAddress);
  };

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        setError(null);
      }, 2500);
    }
  }, [error]);

  return (
    <div className="container mx-auto p-4">
      <div className="text-3xl font-bold mb-6 text-center text-gray-800">
        Addresses
      </div>

      <div className="grid justify-center">
        <button
          className="bg-blue-600 px-4 py-3 rounded-lg"
          onClick={() => setAddingNewAddress(true)}
        >
          Add new Address
        </button>
      </div>

      {error && <div className="text-red-500 text-center mt-4">{error}</div>}

      {addingNewAddress && (
        <div className="rounded-lg shadow-md p-4 mx-4 my-6 bg-white flex flex-col justify-between ">
          <h3 className="text-lg font-semibold mb-3 text-black">
            Provide New Address Details
          </h3>
          <div className="flex flex-col space-y-2 mb-4">
            <input
              type="text"
              name="addressLine1"
              value={newAddress.addressLine1}
              onChange={handleInputChange}
              className="rounded-md border bg-purple-200 border-gray-300 py-2 px-4 text-slate-400"
              placeholder="Address Line 1 (Required)"
              required
            />
            <input
              type="text"
              name="addressLine2"
              value={newAddress.addressLine2}
              onChange={handleInputChange}
              className="rounded-md border bg-purple-200 border-gray-300 py-2 px-4 text-slate-400"
              placeholder="Address Line 2"
            />
            <input
              type="text"
              name="city"
              value={newAddress.city}
              onChange={handleInputChange}
              className="rounded-md border bg-purple-200 border-gray-300 py-2 px-4 text-slate-400"
              placeholder="City (Required)"
              required
            />
            <input
              type="text"
              name="state"
              value={newAddress.state}
              onChange={handleInputChange}
              className="rounded-md border bg-purple-200 border-gray-300 py-2 px-4 text-slate-400"
              placeholder="State"
            />
            <input
              type="text"
              name="zipcode"
              value={newAddress.zipcode}
              onChange={handleInputChange}
              className="rounded-md border bg-purple-200 border-gray-300 py-2 px-4 text-slate-400"
              placeholder="Zipcode (Required)"
              required
            />
            <input
              type="text"
              name="country"
              value={newAddress.country}
              onChange={handleInputChange}
              className="rounded-md border bg-purple-200 border-gray-300 py-2 px-4 text-slate-400"
              placeholder="Country (Required)"
              required
            />
            <input
              type="text"
              name="phoneNumber"
              value={newAddress.phoneNumber}
              onChange={handleInputChange}
              className="rounded-md border bg-purple-200 border-gray-300 py-2 px-4 text-slate-400"
              placeholder="Contact (Required)"
              required
            />
          </div>
          <div className="flex space-x-4">
            <button
              onClick={handleAdd}
              className="text-blue-500 hover:text-blue-700 focus:outline-none text-s bg-transparent"
            >
              Save Address
            </button>
            <button
              onClick={() => {
                setAddingNewAddress(false);
                setNewAddress({});
              }}
              className="text-red-500 hover:text-red-700 focus:outline-none text-s bg-transparent"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mx-4">
        {addressData &&
          addressData.map((address, index) => (
            <div
              key={address._id}
              className={`rounded-lg shadow-md p-4 ${
                editMode === address._id ? "bg-gray-100" : "bg-white"
              } flex flex-col justify-between`}
            >
              {editMode === address._id ? (
                <>
                  <h3 className="text-lg font-semibold mb-2 text-black">
                    Address {index + 1}
                  </h3>
                  <div className="flex flex-col space-y-2 mb-4">
                    <input
                      type="text"
                      value={editedValues.addressLine1}
                      onChange={(e) =>
                        setEditedValues({
                          ...editedValues,
                          addressLine1: e.target.value,
                        })
                      }
                      className="rounded-md border bg-purple-200 border-gray-300 py-2 px-4 text-slate-400"
                      placeholder="Address Line 1"
                    />
                    <input
                      type="text"
                      value={editedValues.addressLine2}
                      onChange={(e) =>
                        setEditedValues({
                          ...editedValues,
                          addressLine2: e.target.value,
                        })
                      }
                      className="rounded-md border bg-purple-200 border-gray-300 py-2 px-4 text-slate-400"
                      placeholder="Address Line 2"
                    />
                    <input
                      type="text"
                      value={editedValues.city}
                      onChange={(e) =>
                        setEditedValues({
                          ...editedValues,
                          city: e.target.value,
                        })
                      }
                      className="rounded-md border bg-purple-200 border-gray-300 py-2 px-4 text-slate-400"
                      placeholder="City"
                    />
                    <input
                      type="text"
                      value={editedValues.state}
                      onChange={(e) =>
                        setEditedValues({
                          ...editedValues,
                          state: e.target.value,
                        })
                      }
                      className="rounded-md border bg-purple-200 border-gray-300 py-2 px-4 text-slate-400"
                      placeholder="State"
                    />
                    <input
                      type="text"
                      value={editedValues.zipcode}
                      onChange={(e) =>
                        setEditedValues({
                          ...editedValues,
                          zipcode: e.target.value,
                        })
                      }
                      className="rounded-md border bg-purple-200 border-gray-300 py-2 px-4 text-slate-400"
                      placeholder="Zipcode"
                    />
                    <input
                      type="text"
                      value={editedValues.country}
                      onChange={(e) =>
                        setEditedValues({
                          ...editedValues,
                          country: e.target.value,
                        })
                      }
                      className="rounded-md border bg-purple-200 border-gray-300 py-2 px-4 text-slate-400"
                      placeholder="Country"
                    />
                    <input
                      type="text"
                      value={editedValues.phoneNumber}
                      onChange={(e) =>
                        setEditedValues({
                          ...editedValues,
                          phoneNumber: e.target.value,
                        })
                      }
                      className="rounded-md border bg-purple-200 border-gray-300 py-2 px-4 text-slate-400"
                      placeholder="Phone Number"
                    />
                  </div>
                  <div className="flex space-x-4 ">
                    <button
                      onClick={handleSave}
                      className="text-green-500 hover:text-green-700 focus:outline-none text-s bg-transparent"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditMode(null)}
                      className="text-red-500 hover:text-red-700 focus:outline-none text-s bg-transparent"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold mt-2 mb-4 text-black">
                    Address {index + 1}
                  </h3>
                  <div className="flex flex-col mb-2 text-md text-purple-600 space-y-2">
                    <span className="rounded-md border bg-purple-200 border-gray-300 py-2 px-4 text-gray-700">
                      {address.addressLine1}
                    </span>
                    <span className="rounded-md border bg-purple-200 border-gray-300 py-2 px-4 text-gray-700">
                      {address.addressLine2}
                    </span>
                    <span className="rounded-md border bg-purple-200 border-gray-300 py-2 px-4 text-gray-700">
                      <span className="font-mono text-sm text-gray-700">
                        City:{" "}
                      </span>
                      {address.city}
                    </span>
                    <span className="rounded-md border bg-purple-200 border-gray-300 py-2 px-4 text-gray-700">
                      <span className="font-mono text-sm text-gray-700">
                        State:{" "}
                      </span>
                      {address.state}
                    </span>
                    <span className="rounded-md border bg-purple-200 border-gray-300 py-2 px-4 text-gray-700">
                      <span className="font-mono text-sm text-gray-700">
                        Zipcode:{" "}
                      </span>
                      {address.zipcode}
                    </span>
                    <span className="rounded-md border bg-purple-200 border-gray-300 py-2 px-4 text-gray-700">
                      <span className="font-mono text-sm text-gray-700">
                        Country:{" "}
                      </span>
                      {address.country}
                    </span>
                    <span className="rounded-md border bg-purple-200 border-gray-300 py-2 px-4 text-gray-700">
                      <span className="font-mono text-sm text-gray-700">
                        Phone Number:{" "}
                      </span>
                      {address.phoneNumber}
                    </span>
                  </div>
                  <div className="flex space-x-4 mt-2">
                    <button
                      onClick={() => handleUpdate(address._id)}
                      className="text-blue-500 hover:text-blue-700 focus:outline-none text-s bg-transparent"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => handleRemove(address._id)}
                      className="text-red-500 hover:text-red-700 focus:outline-none text-s bg-transparent"
                    >
                      Remove
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
      </div>
      <Modal
        showModal={showModal}
        handleClose={handleCloseModal}
        handleConfirm={handleConfirmDeletion}
        message="Are you sure you want to delete the address"
      />
    </div>
  );
}

export default Addresses;

