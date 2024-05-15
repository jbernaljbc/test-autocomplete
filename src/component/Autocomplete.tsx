import "./autocomplete.css";

import React, { useState, useRef, useEffect, useCallback } from "react";

interface Country {
  name: string;
  flag?: string;
}

const API = "https://restcountries.com/v3.1/name";
const NO_MATCHES_FOUND = "no matches found";

const Autocomplete: React.FC = () => {
  const [input, setInput] = useState("");
  const [countryList, setCountryList] = useState<Country[]>([]);
  const [isSelected, setIsSelected] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);

  const throttle = (func: Function, limit: number): Function => {
    let inThrottle: boolean = false;
    return function (this: any) {
      const args: IArguments = arguments;
      const context: any = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  };

  const getCountryData = useCallback(
    throttle((input: string) => {
      if (!isSelected && input !== "") {
        fetch(`${API}/${input}`)
          .then((response) => response.json())
          .then((data) => {
            setCountryList(
              data.map((item: any) => ({
                name: item.name.common,
                flag: item.flags.png,
              }))
            );
            setSelectedIndex(-1);
          })
          .catch((error) => {
            setCountryList([{ name: NO_MATCHES_FOUND }]);
          });
      }
    }, 200),
    []
  );

  useEffect(() => {
    if (inputRef.current) {
      (inputRef.current as HTMLInputElement).focus();
    }
  });

  useEffect(() => {
    if (!isSelected) {
      getCountryData(input);
    }
  }, [input, isSelected, getCountryData]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      setSelectedIndex((prevIndex) =>
        Math.min(prevIndex + 1, countryList.length - 1)
      );
    } else if (event.key === "ArrowUp") {
      setSelectedIndex((prevIndex) => Math.max(prevIndex - 1, 0));
    } else if (event.key === "Enter" && selectedIndex >= 0) {
      setSelectedCountry(countryList[selectedIndex]);
    } else if (event.key === "Escape") {
      clear();
    }
  };

  const handleOnClickCard = (country: Country) => {
    setSelectedCountry(country);
  };

  const handleOnInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSelected(false);
    setInput(e.target.value);
  };

  const handleClearInput = () => {
    clear();
  };

  const highlightText = (item: Country, highlight: string) => {
    const parts = item.name.split(new RegExp(`(${highlight})`, "gi"));
    return (
      <span>
        {parts.map((part, key) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <b key={`bold-${key}`}>{part}</b>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  const setSelectedCountry = (country: Country) => {
    if (country) {
      setIsSelected(true);
      setCountryList([]);
      setInput(country.name === NO_MATCHES_FOUND ? "" : country.name);
    }
  };

  const clear = () => {
    setInput("");
    setCountryList([]);
  };

  return (
    <div className="search-container">
      <p className="title">Travel time</p>
      <img src="/travel2.png" alt="search" />
      <input
        type="text"
        ref={inputRef}
        placeholder="Let's see your next destination here!"
        value={input}
        onChange={handleOnInputChange}
        onKeyDown={handleKeyDown}
      />
      {input && (
        <div className="clear-icon" onClick={handleClearInput}>
          &#10005;
        </div>
      )}
      {countryList && countryList.length > 0 && (
        <ul className="country-list">
          {countryList.map((country: Country, key) => (
            <li
              key={key}
              className={key === selectedIndex ? "selected" : ""}
              onClick={() => handleOnClickCard(country)}
            >
              {country.name !== NO_MATCHES_FOUND && (
                <img src={country.flag} alt={country.name} />
              )}
              {highlightText(country, input)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Autocomplete;
