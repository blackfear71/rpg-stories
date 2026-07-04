<?php
enum EnumSseEvent: string
{
    case ERROR = 'error';
    case GET_GIFTS = 'get_gifts';
    case GET_PLAYERS = 'get_players';
    case IS_ALIVE = 'is_alive';
    case IS_CLOSING = 'is_closing';
    case IS_INITIALIZED = 'is_initialized';
}
