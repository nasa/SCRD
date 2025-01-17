/*
    Copyright 2014 OPM.gov

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
*/

package gov.opm.scrd.batchprocessing.jobs;

/**
 * <p>This exception is thrown when there is any problem with configuration.</p>
 *  <p>Thread - safety. The class is not thread - safe.</p>
 *
 * @author faeton, TCSASSEMBLER
 * @version 1.0
 */
public class BatchProcessingConfigurationException extends RuntimeException {
    /** The serial version id. */
    private static final long serialVersionUID = -357993763662680100L;

    /**
     * Constructor with message parameter.
     *
     * @param message exception message.
     */
    public BatchProcessingConfigurationException(String message) {
        super(message);
    }

    /**
     * Constructor with message and cause parameter.
     *
     * @param message exception message.
     * @param cause exception cause.
     */
    public BatchProcessingConfigurationException(String message, Throwable cause) {
        super(message, cause);
    }
}
