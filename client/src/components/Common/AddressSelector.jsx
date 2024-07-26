import React, { useState, useEffect, memo } from 'react';
import axios from 'axios';

const AddressSelector = ({ setPayload, reset }) => {
    const [cities, setCities] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [selectedCityId, setSelectedCityId] = useState("");
    const [selectedCityName, setSelectedCityName] = useState("");
    const [selectedDistrictId, setSelectedDistrictId] = useState("");
    const [selectedDistrictName, setSelectedDistrictName] = useState("");
    const [selectedWardId, setSelectedWardId] = useState("");
    const [selectedWardName, setSelectedWardName] = useState("");
    const [address, setAddress] = useState("");

    useEffect(() => {
        axios.get('https://raw.githubusercontent.com/kenzouno1/DiaGioiHanhChinhVN/master/data.json')
            .then(response => {
                setCities(response.data);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }, []);

    useEffect(() => {
        if (reset) {
            setSelectedCityId("");
            setSelectedCityName("");
            setSelectedDistrictId("");
            setSelectedDistrictName("");
            setSelectedWardId("");
            setSelectedWardName("");
            setAddress("");
            setDistricts([]);
            setWards([]);
            setPayload(prev => ({
                ...prev,
                address: '',
                city: '',
                district: '',
                ward: ''
            }));
        }
    }, [reset, setPayload]);

    const handleCityChange = (e) => {
        const selectedCityId = e.target.value;
        setSelectedCityId(selectedCityId);
        let selectedCityName = "";
        if (selectedCityId !== "") {
            const selectedCity = cities.find(city => city.Id === selectedCityId);
            selectedCityName = selectedCity ? selectedCity.Name : "";
            setDistricts(selectedCity ? selectedCity.Districts : []);
            setWards([]);
        } else {
            setDistricts([]);
            setWards([]);
        }
        setSelectedCityName(selectedCityName);
        setPayload(prev => ({ ...prev, city: selectedCityName, district: "", ward: "" }));
    };

    const handleDistrictChange = (e) => {
        const selectedDistrictId = e.target.value;
        setSelectedDistrictId(selectedDistrictId);
        let selectedDistrictName = "";
        if (selectedCityId !== "" && selectedDistrictId !== "") {
            const selectedCity = cities.find(city => city.Id === selectedCityId);
            if (selectedCity) {
                const selectedDistrict = selectedCity.Districts.find(district => district.Id === selectedDistrictId);
                selectedDistrictName = selectedDistrict ? selectedDistrict.Name : "";
                setWards(selectedDistrict ? selectedDistrict.Wards : []);
            }
        } else {
            setWards([]);
        }
        setSelectedDistrictName(selectedDistrictName);
        setPayload(prev => ({ ...prev, district: selectedDistrictName, ward: "" }));
    };

    const handleWardChange = (e) => {
        const selectedWardId = e.target.value;
        setSelectedWardId(selectedWardId);
        let selectedWardName = "";
        if (selectedDistrictId !== "" && selectedWardId !== "") {
            const selectedCity = cities.find(city => city.Id === selectedCityId);
            if (selectedCity) {
                const selectedDistrict = selectedCity.Districts.find(district => district.Id === selectedDistrictId);
                if (selectedDistrict) {
                    const selectedWard = selectedDistrict.Wards.find(ward => ward.Id === selectedWardId);
                    selectedWardName = selectedWard ? selectedWard.Name : "";
                }
            }
        }
        setSelectedWardName(selectedWardName);
        setPayload(prev => ({ ...prev, ward: selectedWardName }));
    };

    return (
        <div className='w-full flex flex-col gap-3'>
            <input
                value={address}
                onChange={e => {
                    setAddress(e.target.value);
                    setPayload(prev => ({ ...prev, address: e.target.value }));
                }}
                placeholder="Enter address detail, name street..."
                className='px-4 py-2 outline-none rounded-sm border border-gray-200 w-full mt-2 placeholder:text-sm placeholder:italic'
            />
            <div className='w-full flex flex-col md:flex-row gap-2'>
                <div className='relative gap-1 mb-2 flex flex-col w-full'>
                    <select
                        id="city"
                        value={selectedCityId}
                        onChange={handleCityChange}
                        className="px-4 py-2 outline-none text-sm italic rounded-sm border border-gray-200 w-full mt-2 placeholder:text-sm placeholder:italic"
                    >
                        <option value="">Select Province</option>
                        {cities.map(city => (
                            <option key={city.Id} value={city.Id}>{city.Name}</option>
                        ))}
                    </select>
                </div>

                <div className='relative gap-1 mb-2 flex flex-col w-full'>
                    <select
                        id="district"
                        value={selectedDistrictId}
                        onChange={handleDistrictChange}
                        className="px-4 py-2 outline-none text-sm italic rounded-sm border border-gray-200 w-full mt-2 placeholder:text-sm placeholder:italic"
                    >
                        <option value="">Select District</option>
                        {districts.map(district => (
                            <option key={district.Id} value={district.Id}>{district.Name}</option>
                        ))}
                    </select>
                </div>

                <div className='relative gap-1 mb-2 flex flex-col w-full'>
                    <select
                        id="ward"
                        value={selectedWardId}
                        onChange={handleWardChange}
                        className="px-4 py-2 outline-none text-sm italic rounded-sm border border-gray-200 w-full mt-2 placeholder:text-sm placeholder:italic"
                    >
                        <option value="">Select Ward</option>
                        {wards.map(ward => (
                            <option key={ward.Id} value={ward.Id}>{ward.Name}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};

export default memo(AddressSelector);
