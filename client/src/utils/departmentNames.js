// Department name mapping
export const departmentNames = {
    global_pagoda: 'GVP - Public Relations',
    food_court: 'Food Court',
    souvenir_shop: 'Souvenir Shop',
    dhamma_alaya: 'Dhammalaya',
    dpvc: 'DPVC',
    global: 'All Departments'
};

export const getDepartmentName = (departmentId) => {
    return departmentNames[departmentId] || departmentId.replace('_', ' ');
};
