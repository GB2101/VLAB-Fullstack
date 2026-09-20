<?php

namespace App\Enums;

enum Category: string
{
    case Appointment = 'CONSULTA';
    case Exam = 'EXAME';
    case Vaccination = 'VACINACAO';
    case Other = 'OUTRO';
}
