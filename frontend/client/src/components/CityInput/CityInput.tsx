import { getCities } from '../../utils/api';
import { ICityInput } from '../../utils/interfaces';
import styles from './CityInput.module.css';
import { useEffect, useRef, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
interface ICity {
  city_id: string;
  name: string;
  has_lyceum: boolean;
}
interface ICityInputProps {
  message: ICityInput;
  handleSend: any;
}
const CityInput = ({ message, handleSend }: ICityInputProps) => {
  const {
    message_id,
    has_lyceum_next_message_character,
    no_lyceum_next_message_character,
  } = message;
  const [isOpen, setIsOpen] = useState(false);
  const [cities, setCities] = useState<ICity[]>([]);
  const [filteredCities, setFilteredCities] = useState<ICity[]>([]);
  const dropdownRef = useRef<null | HTMLDivElement>(null);
  const [selectedCity, setSelectedCity] = useState<ICity>({
    city_id: '',
    name: '',
    has_lyceum: false,
  });
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    getCities().then((data) => setCities(data));
  }, []);
  useEffect(() => {
    dropdownRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [isOpen]);
  useEffect(() => {
    debouncedFilterCities(inputValue)!;
    if (inputValue !== selectedCity.name) {
      setSelectedCity({ city_id: '', name: '', has_lyceum: false });
    }
  }, [inputValue]);

  const handleClickOutside = (e: any) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setIsOpen(false);
    }
  };
  useEffect(() => {
    document.addEventListener('mousedown', (e) => handleClickOutside(e));
    return () => {
      document.removeEventListener('mousedown', (e) => handleClickOutside(e));
    };
  }, [dropdownRef]);
  const handleSelect = (city_id: any, name: any, has_lyceum: boolean) => {
    setSelectedCity({ city_id, name, has_lyceum });
    setInputValue(name);
    setIsOpen(false);
  };
  const debouncedFilterCities = useDebouncedCallback((inputValue) => {
    console.log(inputValue);
    const curFilteredCity = [
      ...cities.filter((city) =>
        city.name.toLowerCase().includes(inputValue.toLowerCase()),
      ),
    ];
    // setIsOpen(true);
    setFilteredCities(curFilteredCity);
    if (
      inputValue.length !== 0 &&
      curFilteredCity.length !== 0 &&
      inputValue !== selectedCity.name
    ) {
      setIsOpen(true);
    } else if (inputValue === selectedCity.name) {
      setIsOpen(false);
    } else {
      setIsOpen(false);
    }
    return curFilteredCity;
  }, 700);

  const handleChange = (e: any) => {
    setInputValue(e.currentTarget.value);
  };
  const handlePressKey = (e: any) => {
    if (e.key === 'Enter' && filteredCities.length === 1) {
      setInputValue(filteredCities[0].name);
      setSelectedCity({
        city_id: filteredCities[0].city_id,
        name: filteredCities[0].name,
        has_lyceum: filteredCities[0].has_lyceum,
      });
    }
    if (e.key === 'Enter' && selectedCity.name.length > 0) {
      const character = selectedCity.has_lyceum
        ? has_lyceum_next_message_character
        : no_lyceum_next_message_character;
      handleSend(
        character,
        message_id,
        selectedCity.name,
        1,
        selectedCity.city_id,
      );
    }
  };
  const handleClear = () => {
    setInputValue('');
    setSelectedCity({ city_id: '', name: '', has_lyceum: false });
  };
  return (
    <div className={styles.wrapper}>
      <div className={styles.select}>
        <div
          className={`${styles.input} ${isOpen ? styles.inputActive : ''}`}
          role='button'
          aria-haspopup='listbox'
          aria-expanded={isOpen}
        >
          <input
            type='text'
            name='city'
            value={inputValue}
            onClick={(e) => {
              e.stopPropagation();
            }}
            onChange={(e) => {
              handleChange(e);
            }}
            onKeyDown={(e) => {
              handlePressKey(e);
            }}
            className={styles.text_input}
          />
          <button
            className={`${styles.clearBtn} ${
              !(inputValue.length > 0) && styles.clearBtn_type_hide
            }`}
            onClick={() => handleClear()}
          ></button>
        </div>
        {isOpen && (
          <div
            className={styles.dropdown}
            role='listbox'
          >
            <div
              className={styles.dropdownContainer}
              ref={dropdownRef}
            >
              {filteredCities.map((city) => (
                <div
                  key={city.city_id}
                  className={`${styles.dropdownItem} ${
                    selectedCity.city_id === city.city_id ? styles.selected : ''
                  }`}
                  onClick={() =>
                    handleSelect(city.city_id, city.name, city.has_lyceum)
                  }
                >
                  {city.name}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <button
        className={styles.button}
        disabled={!selectedCity.name}
        onClick={() => {
          const character = selectedCity.has_lyceum
            ? has_lyceum_next_message_character
            : no_lyceum_next_message_character;
          handleSend(
            character,
            message_id,
            selectedCity.name,
            1,
            selectedCity.city_id,
          );
        }}
      ></button>
    </div>
  );
};

export default CityInput;
