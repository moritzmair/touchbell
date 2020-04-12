# frozen_string_literal: true

class BellsController < ApplicationController
  before_action :set_bell, only: %i[show edit update destroy ringring]
  before_action :authenticate_user!, except: :ringring

  def index
    @bells = Bell.all
  end

  def show
    redirect_to(bells_url, alert: 'You can not view details for this bell') && return unless current_user == @bell.user || current_user.admin?

    unless params[:enabled].nil?
      @bell.enabled = params[:enabled]
      @bell.save
      redirect_to(bells_url, notice: 'bell was enabled or disabled')
    end
  end

  def new
    @bell = Bell.new
  end

  def edit; end

  def create
    redirect_to(bells_url, alert: 'You can only create one bell') && return unless current_user.bells.count.zero? || current_user.admin?

    @bell = Bell.new(bell_params)
    @bell.user = current_user

    if @bell.save
      redirect_to @bell, notice: 'Bell was successfully created.'
    else
      render :new
    end
  end

  def update
    redirect_to(bells_url, alert: 'You can not edit this bell') && return unless current_user == @bell.user || current_user.admin?

    if @bell.update(bell_params)
      redirect_to @bell, notice: 'Bell was successfully updated.'
    else
      render :edit
    end
  end

  def destroy
    redirect_to(bells_url, alert: 'You can not delete this bell') && return unless current_user == @bell.user || current_user.admin?

    @bell.destroy
    redirect_to bells_url, notice: 'Bell was successfully destroyed.'
  end

  def post_service
    require 'net/http'
    require 'uri'
    require 'json'

    uri = URI.parse(@bell.trigger)

    header = if @bell.authorization_header != 'NULL'
               { "Content-Type": 'application/json', "Authorization": @bell.authorization_header.to_s }
             else
               { "Content-Type": 'application/json' }
             end

    body = JSON.parse(@bell.request_body)
    # Create the HTTP objects
    request = Net::HTTP::Post.new(uri.request_uri, header)
    request.body = body.to_json

    # Send the request
    res = Net::HTTP.start(uri.hostname, uri.port, use_ssl: uri.scheme == 'https') do |http|
      http.request(request)

      render json: res.to_json
    end
  end

  def get_service
    uri = URI(@bell.trigger)
    response = Net::HTTP.get(uri)
    render json: response.to_json
  end

  def ringring
    case @bell.request_type
    when 'POST'
      post_service
    when 'GET'
      get_service
    else
      puts Unknown Request Type
    end
  end

  private

  # Use callbacks to share common setup or constraints between actions.
  def set_bell
    @bell = Bell.find(params[:id])
  end

  # Only allow a trusted parameter "white list" through.
  def bell_params
    params.require(:bell).permit(:name, :trigger, :admin_hash, :logo, :background, :enabled, :request_body, :request_type, :authorization_header)
  end
end
