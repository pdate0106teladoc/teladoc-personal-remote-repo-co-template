import { useEffect, useRef, useState } from "react";
import { IoIosClose } from "react-icons/io";
import { CheckmarkIcon } from "@/assets";
import { Dropdown } from "react-bootstrap";
import "./MultiSelectSearch.scss";
import api from "@/api/apiService";
import { API_ENDPOINTS, ToastType, ERROR_MESSAGES } from "@/constants";
import { useLocation, useParams } from "react-router-dom";
import { SearchIcon, showCustomToast } from "@ucc/common-ui";

interface props {
    label: string;
    placeholder?: string;
    isRequired?: boolean;
    customClass?: string;
    preSelected?: Record<string, string>;
    onChange: (selected: Record<string, string>) => void;
};

const SelectedItems: React.FC<{
    selected: Record<string, string>;
    onRemove: (id: string) => void;
}> = ({ selected, onRemove }) => {
    return (
        <>
            {Object.entries(selected)
                .filter(([_, isSelected]) => isSelected)
                .map(([id]) => (
                    <span
                        key={id}
                        className="pill-item"
                    >
                        {selected[id]}
                        <IoIosClose
                            id="close-img"
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemove(id);
                            }}
                        />
                    </span>
                ))}
        </>
    );
};

const MultiSelectSearch: React.FC<props> = ({ label, preSelected, placeholder, isRequired, onChange, customClass }) => {
    const searchUrl = import.meta.env.VITE_SEARCH_BASE_URL;
    const [selected, setSelected] = useState<Record<string, string>>(preSelected || {});
    const [inputValue, setInputValue] = useState<string>("");
    const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
    const [options, setFilteredOptions] = useState<Record<string, string>>({});
    const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    useEffect(() => setSelected(preSelected || {}), [preSelected]);
    const getOptions = async (input: string, type: string) => {
        if (input.trim().length < 2) return;
        let globalSearchTerm = "", globalSearchType = "";
        if (location.pathname.includes("org-detail") || location.pathname.includes("groups")) {
            globalSearchTerm = id ? id : "";
            globalSearchType = location.pathname.includes("org-detail") ? "organization" : "group";
        }
        else {
            const searchParams = new URLSearchParams(location.search);
            const searchTerm = searchParams.get("searchTerm");
            globalSearchTerm = searchTerm ? searchTerm : "";
            globalSearchType = "name";
        }
        try {
            const params = new URLSearchParams({
                globalSearchTerm,
                globalSearchType,
                searchTerm: input,
                searchType: type,
            });
            const url = `${searchUrl}${API_ENDPOINTS.contactFilterSearch}?${params.toString()}`;
            const res: any = await api.get(url);
            const responseData = res?.data || res;
            const finalData: Record<string, string> = responseData?.reduce((acc: Record<string, string>, item: any) => {
                acc[item.id] = item.name;
                return acc;
            }, {});
            return finalData;
        }
        catch (error) {
            showCustomToast({
                type: ToastType.Error,
                title: "Failed",
                message: ERROR_MESSAGES.SOMETHINGS_WRONG,
            });
        }
    };
    const toggleSelection = (id: string) => {
        setSelected((prev) => {
            const newSelected = { ...prev };

            if (newSelected[id]) {
                delete newSelected[id];
            } else {
                newSelected[id] = options[id];
            }
            onChange(newSelected);
            setInputValue("");
            return newSelected;
        })
    };

    const inputValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }
        debounceTimeoutRef.current = setTimeout(async () => {
            if (value.trim().length >= 2) {
                const newOptions = await getOptions(value, label.toLowerCase());
                setFilteredOptions(newOptions || {});
                setDropdownOpen(true);
            } else {
                setFilteredOptions({});
                setDropdownOpen(false);
            }
        }, 300);
    }

    return (
        <div className={`multi-search-input ${customClass}`}>
            {label && <label htmlFor="custom-input" className="d-flex flex-row">
                {label} {isRequired && <span className="required-label"> *</span>}
            </label>}
            <div className={`custom-input-container ${customClass}`}>
                <div className={`d-flex flex-row w-100 justify-content-between custom-input-box ${customClass}`}>
                    <Dropdown autoClose="outside" show={dropdownOpen} onToggle={(isOpen) => setDropdownOpen(isOpen)}>
                        <Dropdown.Toggle variant="primary" id="dropdown-basic-button" onClick={(e) => e.stopPropagation()}>
                            <div className="d-flex flex-row">
                                <span className="search-icon">
                                    <SearchIcon />
                                </span>
                                <div className="multi-select-content d-flex flex-row align-items-center">
                                    <SelectedItems
                                        selected={selected}
                                        onRemove={(id) => toggleSelection(id)}
                                    />
                                    <input
                                        id="custom-input"
                                        type="text"
                                        placeholder={placeholder}
                                        autoComplete="off"
                                        className="custom-input"
                                        value={inputValue}
                                        onChange={inputValueChange}
                                    />
                                </div>
                            </div>
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            {Object.entries(options).length ? (
                                Object.entries(options).map(([id, label], idx) => (
                                    <div key={idx} onClick={(e) => e.stopPropagation()}>
                                        <div className="d-flex flex-row align-items-center gap-2 p-2 option-item"
                                            onClick={() => toggleSelection(id)}>
                                            <div className="check-icon">
                                                {selected[id] && <CheckmarkIcon />}
                                            </div>
                                            <span>{label}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-options p-2">No results found</div>
                            )}
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            </div>
        </div>
    )
}
export default MultiSelectSearch;
