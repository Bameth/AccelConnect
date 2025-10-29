import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-component',
  imports: [CommonModule],
  templateUrl: './admin-component.html',
  styleUrl: './admin-component.css',
})
export class AdminComponent {
  tableData = [
    {
      id: 1,
      user: {
        image: '/images/user/user-17.jpg',
        name: 'Fatou Diop',
        role: 'Développeuse Frontend',
      },
      restaurant: 'JOLOF',
      items: [
        { name: 'Thiébou Dieune', quantity: 1 },
        { name: 'Jus de Bissap', quantity: 2 },
      ],
      total: '3 500 FCFA',
      status: 'Payée',
      time: '12:45',
    },
    {
      id: 2,
      user: {
        image: '/images/user/user-18.jpg',
        name: 'Mamadou Sall',
        role: 'Chef de Projet',
      },
      restaurant: 'RODRA',
      items: [
        { name: 'Yassa Poulet', quantity: 1 },
        { name: 'Salade', quantity: 1 },
        { name: 'Eau minérale', quantity: 1 },
      ],
      total: '4 200 FCFA',
      status: 'En attente',
      time: '13:10',
    },
    {
      id: 3,
      user: {
        image: '/images/user/user-19.jpg',
        name: 'Aïssatou Ndiaye',
        role: 'Designer UX/UI',
      },
      restaurant: 'CHEZ EVA',
      items: [
        { name: 'Mafé', quantity: 1 },
        { name: 'Jus de Mangue', quantity: 1 },
      ],
      total: '3 000 FCFA',
      status: 'Payée',
      time: '12:30',
    },
    {
      id: 4,
      user: {
        image: '/images/user/user-20.jpg',
        name: 'Ousmane Ba',
        role: 'Développeur Backend',
      },
      restaurant: 'JOLOF',
      items: [
        { name: 'Thiébou Yapp', quantity: 1 },
        { name: 'Café Touba', quantity: 1 },
      ],
      total: '3 800 FCFA',
      status: 'Payée',
      time: '12:50',
    },
    {
      id: 5,
      user: {
        image: '/images/user/user-21.jpg',
        name: 'Khadija Mbaye',
        role: 'Responsable RH',
      },
      restaurant: 'RODRA',
      items: [
        { name: 'Poisson Braisé', quantity: 1 },
        { name: 'Attiéké', quantity: 1 },
        { name: 'Jus de Gingembre', quantity: 2 },
      ],
      total: '5 500 FCFA',
      status: 'En attente',
      time: '13:00',
    },
    {
      id: 6,
      user: {
        image: '/images/user/user-22.jpg',
        name: 'Ibrahima Sarr',
        role: 'Comptable',
      },
      restaurant: 'CHEZ EVA',
      items: [
        { name: 'Domoda', quantity: 1 },
        { name: 'Jus de Bissap', quantity: 1 },
      ],
      total: '2 800 FCFA',
      status: 'Payée',
      time: '12:35',
    },
    {
      id: 7,
      user: {
        image: '/images/user/user-23.jpg',
        name: 'Aminata Sow',
        role: 'Marketing Manager',
      },
      restaurant: 'JOLOF',
      items: [
        { name: 'Ceebu Jën', quantity: 1 },
        { name: 'Salade de fruits', quantity: 1 },
      ],
      total: '4 000 FCFA',
      status: 'Annulée',
      time: '12:20',
    },
    {
      id: 8,
      user: {
        image: '/images/user/user-24.jpg',
        name: 'Cheikh Diallo',
        role: 'Support Client',
      },
      restaurant: 'RODRA',
      items: [
        { name: 'Soupe Kandia', quantity: 1 },
        { name: 'Pain', quantity: 2 },
        { name: 'Coca Cola', quantity: 1 },
      ],
      total: '3 200 FCFA',
      status: 'Payée',
      time: '13:15',
    },
  ];
}
