/**
 * Represents a configuration object for the StompService to connect to, pub, and sub.
 */
export interface StompConfig {

  host : string;
  port: number;
  ssl: boolean;

  user : string;
  password : string;

  virtual_host : string;

  heartbeat_in?: number;
  heartbeat_out?: number;

};