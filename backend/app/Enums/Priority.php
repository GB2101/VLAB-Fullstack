<?php

namespace App\Enums;

enum Priority: string
{
    case Low = 'BAIXA';
    case Medium = 'MEDIA';
    case High = 'ALTA';
    case Urgent = 'URGENTE';
}
