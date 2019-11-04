import React, { useState, useContext } from 'react';
import './index.css';
import { setUserName } from '../../store/user/actionCreators';
import { UserDispatch } from '../../routing/App';

export function Login() {
  const [userName, handleUserNameField] = useState('');
  const dispatch = useContext(UserDispatch);
  const submit = e => {
    e.preventDefault();
    dispatch(setUserName(userName));
  };
  return (
    <form className='login' onSubmit={submit}>
      <div className='login__icon'>
        <svg className='login__svg' viewBox='0 0 24 24' width={24} height={24}>
          <g fill='none'>
            <path d='M0 0h24v24H0V0z' />
            <path d='M0 0h24v24H0V0z' opacity='.87' />
          </g>
          <path d='M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2
      2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9
      6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9
      14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2
      2z' />
        </svg>
      </div>
      <label htmlFor='username' className='login__label'>User name</label>
      <input
        type='text'
        id='username'
        required
        className='login__input'
        onChange={e => handleUserNameField(e.target.value)}
        value={userName}
      />
      <input
        type='submit'
        value='Sign in'
        className='login__btn'
      />
    </form>
  );
}
