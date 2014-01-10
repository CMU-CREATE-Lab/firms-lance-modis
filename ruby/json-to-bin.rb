#!/usr/bin/env ruby2.0

load File.dirname(__FILE__) + "/../../drilling-data-tools/capture/libs/utils.rb"

require 'json'
require 'optparse'
require 'ostruct'

class CustomFormatOptparse
  def self.parse(args)
    # defaults
    options = OpenStruct.new

    opt_parser = OptionParser.new do |opts|
      opts.banner = "Usage: custom-format.rb [options]"

      opts.separator ""
      opts.separator "Specific options:"

      opts.on("-f", "--file FILE", "JSON file") do |file|
        options.file = file
      end

    end

    opt_parser.parse!(args)
    options
  end
end

def main
  options = CustomFormatOptparse.parse(ARGV)
  unless File.exists? options.file
    puts "Could not find or open #{options.file}"
    return
  end
  latlonFilename =  File.basename(options.file, ".json") + "_latlon.bin"
  latlonBin = File.open(latlonFilename, 'wb')
  acqDateFilename =  File.basename(options.file, ".json") + "_acq_date.bin"
  acqDateBin = File.open(acqDateFilename, 'wb')  
  data = read_json(options.file)
  data.each do |d|
    latlonBin.write([d["latitude"].to_f].pack("e"))
    latlonBin.write([d["longitude"].to_f].pack("e"))
    acqDateBin.write([DateTime.strptime(d["acq_date"], '%Y-%m-%d').to_time.to_i].pack("l<"))
  end
  latlonBin.close
  acqDateBin.close
end

main
  
