import React from 'react';
import { Card } from '../shared/components/card/card';
import { Link } from 'react-router-dom';

import './my-resources.scss';

const MY_RESOURCES_MAP = [
  {
    label: 'Weather Stations',
    href: '#',
    className: 'weather-stations',
  },
  {
    label: 'Agrotechnical Resources',
    href: '#',
    className: 'agrotechnical-resources',
  },
  {
    label: 'Aerial Survey',
    href: '#',
    className: 'aerial-survey',
  },
  {
    label: 'Fertilizers and Protection',
    href: '#',
    className: 'fertilizers',
  },
  {
    label: 'Human Resources',
    href: '#',
    className: 'human-resources',
  },
]

export function MyResources() {
  return (
    <Card className="my-resources-card" hasCloseBtn>
      <div className="d-flex">
        {
          MY_RESOURCES_MAP.map(({ label, href, className }) => 
            <Link className="resource-link medium d-block" key={href} to={href}>
              <div className="mb-1">{label}</div>
              <div className="image-container position-relative">
                <div className={`image w-100 h-100 ${className}`} />
                <div className="hover-overlay round" />
              </div>
            </Link>
          )
        }
      </div>
    </Card>
  )
}
