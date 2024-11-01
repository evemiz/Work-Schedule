import React, { useEffect, useState } from 'react';
import '../../public/calendar.css'

function Cell(props) {
    const {cell, availability} = props
  return (
    <div className='cell-container'>
    <p>{cell === 0 ? '' : cell}</p>
        <p className='constraint'>
            {availability[cell] && typeof availability[cell] === 'object'
            ? Object.keys(availability[cell])
                .filter((key) => availability[cell][key])
                .map((key) => {
                    const hebrewKeys = {
                    morning: 'בוקר',
                    noon: 'צהריים',
                    evening: 'ערב'
                    };
                    return hebrewKeys[key] || key;
                })
                .join(', ')
            : ''}
        </p>
    </div>
  );
}

export default Cell;

