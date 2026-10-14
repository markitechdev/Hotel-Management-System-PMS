import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Notice from '../components/Notice.jsx';
import RoomTag from '../components/RoomTag.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { createRoom } from '../services/api.js';
import { ROOM_TYPES } from '../services/rooms.js';

const EMPTY_FORM = { room_number: '', room_type: '', nightly_rate: '', capacity: '', notes: '' };

// Mirrors the Laravel validation rules so most mistakes are caught before the request is sent.
function validate(values) {
  const errors = {};
  const roomNumber = values.room_number.trim();
  const rate = values.nightly_rate.trim();
  const capacity = values.capacity.trim();

  if (!roomNumber) errors.room_number = 'Enter a room number.';
  else if (!/^[A-Z0-9-]+$/i.test(roomNumber)) errors.room_number = 'Use letters, numbers and dashes only.';
  else if (roomNumber.length > 10) errors.room_number = 'Room numbers can be up to 10 characters.';

  if (!values.room_type) errors.room_type = 'Choose a room category.';

  if (!rate) errors.nightly_rate = 'Enter the nightly rate.';
  else if (/^-\d*\.?\d+$/.test(rate)) errors.nightly_rate = 'The nightly rate must be more than zero.';
  else if (!/^\d+(\.\d+)?$/.test(rate)) errors.nightly_rate = 'Enter the rate as a number, for example 2500 or 2500.50.';
  else if (Number(rate) <= 0) errors.nightly_rate = 'The nightly rate must be more than zero.';
  else if (!/^\d+(\.\d{1,2})?$/.test(rate)) errors.nightly_rate = 'Use at most two decimal places.';
  else if (Number(rate) > 99999999.99) errors.nightly_rate = 'The nightly rate is too large.';

  if (capacity) {
    if (!/^\d+$/.test(capacity)) errors.capacity = 'Capacity must be a whole number of guests.';
    else if (Number(capacity) < 1 || Number(capacity) > 12) errors.capacity = 'Capacity must be between 1 and 12 guests.';
  }

  if (values.notes.length > 500) errors.notes = 'Notes can be up to 500 characters.';

  return errors;
}

export default function AddRoom() {
  useDocumentTitle('Add room');
  const navigate = useNavigate();

  const [values, setValues] = useState(EMPTY_FORM);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [serverErrors, setServerErrors] = useState({});
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);

  const clientErrors = validate(values);

  function errorFor(field) {
    if (serverErrors[field]) return serverErrors[field];
    if (touched[field] || submitted) return clientErrors[field];
    return undefined;
  }

  function handleChange(event) {
    const { name } = event.target;
    let { value } = event.target;
    if (name === 'room_number') value = value.toUpperCase();

    setValues((current) => ({ ...current, [name]: value }));
    setServerErrors((current) => ({ ...current, [name]: undefined }));
    setSaveError('');
  }

  function handleBlur(event) {
    setTouched((current) => ({ ...current, [event.target.name]: true }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
    setSaveError('');

    if (Object.keys(clientErrors).length > 0) {
      const firstInvalid = Object.keys(EMPTY_FORM).find((field) => clientErrors[field]);
      document.getElementById(firstInvalid)?.focus();
      return;
    }

    setSaving(true);
    try {
      const room = await createRoom({
        room_number: values.room_number.trim(),
        room_type: values.room_type,
        nightly_rate: Number(values.nightly_rate),
        capacity: values.capacity.trim() ? Number(values.capacity) : null,
        notes: values.notes.trim() || null,
      });
      navigate('/rooms', { state: { addedRoom: room } });
    } catch (error) {
      setSaving(false);
      if (error.status === 422 && Object.keys(error.fieldErrors).length > 0) {
        setServerErrors(error.fieldErrors);
        setSaveError('The server could not save the room. Correct the highlighted fields.');
      } else {
        setSaveError(error.message);
      }
    }
  }

  function fieldProps(field) {
    const message = errorFor(field);
    return {
      id: field,
      name: field,
      value: values[field],
      onChange: handleChange,
      onBlur: handleBlur,
      'aria-invalid': Boolean(message),
      'aria-describedby': message ? `${field}-error` : undefined,
    };
  }

  function renderError(field) {
    const message = errorFor(field);
    return message ? (
      <p id={`${field}-error`} className="field__error">
        {message}
      </p>
    ) : null;
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Add room</h1>
          <p className="page-subtitle">New rooms are saved to the database and appear in the room list.</p>
        </div>
      </div>

      <form className="register" onSubmit={handleSubmit} noValidate>
        <div className="register__preview" aria-hidden="true">
          <RoomTag number={values.room_number.trim()} size="large" />
          <p className="register__preview-type">{values.room_type || 'No category chosen'}</p>
        </div>

        <div className="register__fields">
          {saveError && (
            <Notice tone="error" title="Room not saved.">
              {saveError}
            </Notice>
          )}

          <div className="field-row">
            <div className="field">
              <label htmlFor="room_number" className="field__label">
                Room number
              </label>
              <input
                {...fieldProps('room_number')}
                className="field__input field__input--mono"
                type="text"
                maxLength={10}
                autoComplete="off"
                placeholder="e.g. 204"
              />
              {renderError('room_number')}
            </div>

            <div className="field">
              <label htmlFor="room_type" className="field__label">
                Room category
              </label>
              <select {...fieldProps('room_type')} className="field__input field__select">
                <option value="">Choose a category</option>
                {ROOM_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {renderError('room_type')}
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="nightly_rate" className="field__label">
                Nightly rate
              </label>
              <div className="field__affix">
                <span className="field__prefix" aria-hidden="true">
                  ₱
                </span>
                <input
                  {...fieldProps('nightly_rate')}
                  className="field__input field__input--prefixed"
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="0.00"
                />
              </div>
              {renderError('nightly_rate')}
            </div>

            <div className="field">
              <label htmlFor="capacity" className="field__label">
                Capacity <span className="field__optional">(optional)</span>
              </label>
              <input
                {...fieldProps('capacity')}
                className="field__input"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder="Guests"
              />
              {renderError('capacity')}
            </div>
          </div>

          <div className="field">
            <label htmlFor="notes" className="field__label">
              Notes <span className="field__optional">(optional)</span>
            </label>
            <textarea
              {...fieldProps('notes')}
              className="field__input field__textarea"
              rows={3}
              maxLength={500}
              placeholder="Bed setup, view, accessibility features…"
            />
            {renderError('notes')}
          </div>

          <div className="register__actions">
            <button type="submit" className="button button--primary" disabled={saving}>
              {saving ? 'Saving room…' : 'Save room'}
            </button>
            <Link to="/rooms" className="button button--quiet">
              Cancel
            </Link>
          </div>
        </div>
      </form>
    </>
  );
}
