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

package gov.opm.scrd.entities.common;

import static org.junit.Assert.assertNotNull;
import junit.framework.JUnit4TestAdapter;

import org.junit.Before;
import org.junit.Test;

/**
 * <p>
 * Unit tests for {@link BasicPagedSearchFilter} class.
 * </p>
 *
 * @author sparemax
 * @version 1.0
 */
public class BasicPagedSearchFilterUnitTests {
    /**
     * <p>
     * Represents the <code>BasicPagedSearchFilter</code> instance used in tests.
     * </p>
     */
    private BasicPagedSearchFilter instance;

    /**
     * <p>
     * Adapter for earlier versions of JUnit.
     * </p>
     *
     * @return a test suite.
     */
    public static junit.framework.Test suite() {
        return new JUnit4TestAdapter(BasicPagedSearchFilterUnitTests.class);
    }

    /**
     * <p>
     * Sets up the unit tests.
     * </p>
     *
     * @throws Exception
     *             to JUnit.
     */
    @Before
    public void setUp() throws Exception {
        instance = new BasicPagedSearchFilter();
    }

    /**
     * <p>
     * Accuracy test for the constructor <code>BasicPagedSearchFilter()</code>.<br>
     * Instance should be correctly created.
     * </p>
     */
    @Test
    public void testCtor() {
        instance = new BasicPagedSearchFilter();

        assertNotNull("Instance should be created.", instance);
    }

}
